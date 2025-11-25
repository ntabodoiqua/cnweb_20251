package com.cnweb.order_service.service;

import com.cnweb.order_service.client.*;
import com.cnweb.order_service.dto.payment.*;
import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.request.OrderFilterRequest;
import com.cnweb.order_service.dto.request.OrderItemRequest;
import com.cnweb.order_service.dto.response.CouponResponse;
import com.cnweb.order_service.dto.response.CouponValidationResponse;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
import com.cnweb.order_service.mapper.OrderMapper;
import com.cnweb.order_service.repository.OrderRepository;
import com.cnweb.order_service.specification.OrderSpecification;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderServiceImpl implements OrderService {

    OrderRepository orderRepository;
    ProductClient productClient;
    PaymentClient paymentClient;
    OrderMapper orderMapper;
    CouponService couponService;
    @Value("${payment.redirect-url}")
    @NonFinal
    String paymentRedirectUrl;

    @Override
    @Transactional
    public List<OrderResponse> createOrder(String username, OrderCreationRequest request) {
        // 1. Get all variant IDs
        List<String> variantIds = request.getItems().stream()
                .map(OrderItemRequest::getVariantId)
                .toList();

        // 2. Fetch variant details
        ApiResponse<List<VariantInternalDTO>> variantResponse = productClient.getVariants(
                VariantsQueryRequest.builder().variantIds(variantIds).build()
        );

        if (variantResponse.getResult() == null || variantResponse.getResult().isEmpty()) {
            throw new RuntimeException("Products not found");
        }

        List<VariantInternalDTO> variants = variantResponse.getResult();
        Map<String, VariantInternalDTO> variantMap = variants.stream()
                .collect(Collectors.toMap(VariantInternalDTO::getId, v -> v));

        // 3. Group items by Store
        Map<String, List<OrderItemRequest>> itemsByStore = new HashMap<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            VariantInternalDTO variant = variantMap.get(itemRequest.getVariantId());
            if (variant == null) {
                throw new RuntimeException("Product variant not found: " + itemRequest.getVariantId());
            }
            // Check stock
            if (variant.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + variant.getProductName());
            }

            itemsByStore.computeIfAbsent(variant.getStoreId(), k -> new ArrayList<>()).add(itemRequest);
        }

        List<Order> createdOrders = new ArrayList<>();
        List<InventoryChangeRequest> inventoryChanges = new ArrayList<>();

        // Prepare orders (calculate subtotal first)
        for (Map.Entry<String, List<OrderItemRequest>> entry : itemsByStore.entrySet()) {
            String storeId = entry.getKey();
            List<OrderItemRequest> storeItems = entry.getValue();
            String storeName = variantMap.get(storeItems.getFirst().getVariantId()).getStoreName();

            Order order = orderMapper.toOrder(request);
            order.setOrderNumber(generateOrderNumber());
            order.setUsername(username);
            order.setStoreId(storeId);
            order.setStoreName(storeName);

            List<OrderItem> orderItems = new ArrayList<>();
            for (OrderItemRequest itemRequest : storeItems) {
                VariantInternalDTO variant = variantMap.get(itemRequest.getVariantId());
                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .storeId(storeId)
                        .storeName(storeName)
                        .productId(variant.getProductId())
                        .productName(variant.getProductName())
                        .variantId(variant.getId())
                        .variantName(variant.getVariantName())
                        .sku(variant.getSku())
                        .productImage(variant.getImageUrl())
                        .price(variant.getPrice())
                        .quantity(itemRequest.getQuantity())
                        .build();
                orderItem.calculateTotalPrice();
                orderItems.add(orderItem);
                
                inventoryChanges.add(InventoryChangeRequest.builder()
                        .variantId(variant.getId())
                        .quantity(itemRequest.getQuantity())
                        .build());
            }
            order.setItems(orderItems);
            order.calculateTotalAmount(); // Calculates subtotal
            createdOrders.add(order);
        }

        // 4. Apply Coupon Logic (Initial application if provided)
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            applyCoupon(username, request.getCouponCode(), createdOrders);
        }

        // 5. Reserve stock
        productClient.reserveBatch(BatchInventoryChangeRequest.builder()
                .items(inventoryChanges)
                .build());

        try {
            // 6. Save orders
            orderRepository.saveAll(createdOrders);

            // 7. Record Coupon Usage (if applied)
            if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
                 // Only record usage if discount was actually applied to at least one order
                 boolean couponApplied = createdOrders.stream()
                         .anyMatch(o -> o.getDiscountAmount() != null && o.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0);
                 
                 if (couponApplied) {
                     // Use the first order ID for tracking
                     couponService.useCoupon(createdOrders.getFirst().getCouponId(), username, createdOrders.get(0).getId());
                 }
            }
            
            // 8. Map to response (NO PAYMENT INITIATION HERE)
            return createdOrders.stream()
                    .map(orderMapper::toOrderResponse)
                    .toList();

        } catch (Exception e) {
            log.error("Error saving orders, triggering compensation transaction to release stock", e);
            // Compensation: Release reserved stock
            try {
                productClient.releaseBatch(BatchInventoryChangeRequest.builder()
                        .items(inventoryChanges)
                        .build());
            } catch (Exception ex) {
                log.error("CRITICAL: Failed to compensate stock for failed order. Manual intervention required.", ex);
            }
            throw e; // Re-throw to rollback Order transaction
        }
    }

    @Override
    @Transactional
    public List<OrderResponse> applyCouponToOrders(String username, String couponCode, List<String> orderIds) {
        List<Order> orders = orderRepository.findAllById(orderIds);
        
        if (orders.isEmpty()) {
            throw new RuntimeException("Orders not found");
        }
        
        // Validate ownership
        for (Order order : orders) {
            if (!order.getUsername().equals(username)) {
                throw new RuntimeException("Unauthorized access to order: " + order.getId());
            }
            // Only allow applying coupon to PENDING/UNPAID orders
            if (order.getPaymentStatus() == com.cnweb.order_service.enums.PaymentStatus.PAID) {
                throw new RuntimeException("Cannot apply coupon to paid order: " + order.getId());
            }
        }
        
        // Reset existing discounts first
        for (Order order : orders) {
            order.setDiscountAmount(BigDecimal.ZERO);
            order.setCouponCode(null);
            order.setCouponId(null);
            order.calculateTotalAmount(); // Reset total to subtotal
        }
        
        // Apply new coupon
        applyCoupon(username, couponCode, orders);
        
        // Save updates
        orderRepository.saveAll(orders);
        
        // Record usage? 
        // Note: If we record usage here, we might need to handle re-application or removal.
        // For simplicity, we assume usage is recorded/validated. 
        // Ideally, usage should be "reserved" and finalized on payment, but current CouponService uses "useCoupon" immediately.
        // We might need to check if user already used this coupon for THESE orders to avoid double counting if they retry.
        // But CouponService logic is simple. Let's just call useCoupon if applied.
        
        boolean couponApplied = orders.stream()
                .anyMatch(o -> o.getDiscountAmount() != null && o.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0);
        
        if (couponApplied) {
            couponService.useCoupon(orders.getFirst().getCouponId(), username, orders.get(0).getId());
        }
        
        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public com.cnweb.order_service.dto.response.OrderPaymentResponse initiatePayment(String username, List<String> orderIds) {
        List<Order> orders = orderRepository.findAllById(orderIds);
        
        if (orders.isEmpty()) {
            throw new RuntimeException("Orders not found");
        }
        
        // Validate
        for (Order order : orders) {
            if (!order.getUsername().equals(username)) {
                throw new RuntimeException("Unauthorized access to order: " + order.getId());
            }
            if (order.getPaymentStatus() == com.cnweb.order_service.enums.PaymentStatus.PAID) {
                throw new RuntimeException("Order already paid: " + order.getId());
            }
        }
        
        // Calculate total amount for payment
        BigDecimal totalPaymentAmount = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Collect all items for payment request
        List<PaymentItem> paymentItems = new ArrayList<>();
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                paymentItems.add(PaymentItem.builder()
                        .itemId(item.getVariantId())
                        .itemName(item.getProductName() + " - " + item.getVariantName())
                        .itemPrice(item.getPrice().longValue())
                        .itemQuantity(item.getQuantity())
                        .build());
            }
        }
        
        // Create payment request
        CreatePaymentRequest paymentRequest = CreatePaymentRequest.builder()
                .appUser(username)
                .amount(totalPaymentAmount.longValue())
                .description("Thanh toán cho đơn hàng: " + String.join(", ", orders.stream().map(Order::getOrderNumber).toList()))
                .items(paymentItems)
                .embedData(PaymentEmbedData.builder()
                        .orderIds(orderIds)
                        .email(orders.getFirst().getReceiverEmail()) // Assume same email for batch
                        .redirectUrl(paymentRedirectUrl)
                        .build())
                .email(orders.getFirst().getReceiverEmail())
                .phone(orders.getFirst().getReceiverPhone())
                .address(orders.getFirst().getShippingAddress())
                .title("Thanh toán cho " + orders.size() + " đơn hàng")
                .build();
        
        // Call Payment Service
        CreatePaymentResponse paymentResponse = paymentClient.createZaloPayOrder(paymentRequest);
        
        if ("SUCCESS".equals(paymentResponse.getStatus())) {
            String appTransId = paymentResponse.getAppTransId();
            
            // Update orders with payment transaction ID
            for (Order order : orders) {
                order.setPaymentTransactionId(appTransId);
                order.setPaymentStatus(com.cnweb.order_service.enums.PaymentStatus.PENDING);
            }
            orderRepository.saveAll(orders);
            
            return com.cnweb.order_service.dto.response.OrderPaymentResponse.builder()
                    .paymentUrl(paymentResponse.getOrderUrl())
                    .appTransId(appTransId)
                    .message("Payment initiated successfully")
                    .build();
        } else {
            throw new RuntimeException("Payment initialization failed: " + paymentResponse.getMessage());
        }
    }

    @Override
    public Page<OrderResponse> getMyOrders(String username, OrderFilterRequest filter, Pageable pageable) {
        Specification<Order> spec = OrderSpecification.getOrdersByFilter(filter, username, null);
        Page<Order> orders = orderRepository.findAll(spec, pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    @Override
    public Page<OrderResponse> getStoreOrders(String requesterUsername, String storeId, OrderFilterRequest filter, Pageable pageable) {
        // Validate store ownership
        ApiResponse<Boolean> validationResponse = productClient.validateStoreOwner(storeId, requesterUsername);
        if (validationResponse.getResult() == null || !validationResponse.getResult()) {
            throw new RuntimeException("Unauthorized access to store orders");
        }

        Specification<Order> spec = OrderSpecification.getOrdersByFilter(filter, null, storeId);
        Page<Order> orders = orderRepository.findAll(spec, pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    private void applyCoupon(String username, String couponCode, List<Order> orders) {
        CouponResponse coupon = couponService.getCouponByCode(couponCode);
        
        // Validate basic rules
        CouponValidationResponse validation = couponService.validateCoupon(couponCode, java.math.BigDecimal.ZERO, username, null);
        if (!validation.isValid() && !validation.getMessage().contains("Order amount")) {
             // Ignore amount validation here, we do it manually below
             throw new RuntimeException(validation.getMessage());
        }

        if (coupon.isStoreSpecific()) {
            // Apply to specific store order
            for (Order order : orders) {
                if (order.getStoreId().equals(coupon.getStoreId())) {
                    if (order.getSubtotal().compareTo(coupon.getMinOrderAmount()) >= 0) {
                        java.math.BigDecimal discount = calculateDiscount(coupon, order.getSubtotal());
                        order.setDiscountAmount(discount);
                        order.setCouponCode(couponCode);
                        order.setCouponId(coupon.getId());
                        order.setTotalAmount(order.getSubtotal().subtract(discount));
                    }
                }
            }
        } else {
            // Global coupon
            java.math.BigDecimal grandTotal = orders.stream()
                    .map(Order::getSubtotal)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            if (grandTotal.compareTo(coupon.getMinOrderAmount()) >= 0) {
                java.math.BigDecimal totalDiscount = calculateDiscount(coupon, grandTotal);
                
                // Distribute discount
                java.math.BigDecimal remainingDiscount = totalDiscount;
                for (int i = 0; i < orders.size(); i++) {
                    Order order = orders.get(i);
                    java.math.BigDecimal orderDiscount;
                    
                    if (i == orders.size() - 1) {
                        orderDiscount = remainingDiscount; // Last order gets the remainder to avoid rounding issues
                    } else {
                        // orderDiscount = totalDiscount * (orderSubtotal / grandTotal)
                        orderDiscount = totalDiscount.multiply(order.getSubtotal())
                                .divide(grandTotal, 2, java.math.RoundingMode.HALF_UP);
                        remainingDiscount = remainingDiscount.subtract(orderDiscount);
                    }
                    
                    // Ensure discount doesn't exceed subtotal
                    if (orderDiscount.compareTo(order.getSubtotal()) > 0) {
                        orderDiscount = order.getSubtotal();
                    }

                    order.setDiscountAmount(orderDiscount);
                    order.setCouponCode(couponCode);
                    order.setCouponId(coupon.getId());
                    order.setTotalAmount(order.getSubtotal().subtract(orderDiscount));
                }
            }
        }
    }

    private java.math.BigDecimal calculateDiscount(CouponResponse coupon, java.math.BigDecimal amount) {
        java.math.BigDecimal discount = java.math.BigDecimal.ZERO;
        switch (coupon.getDiscountType()) {
            case PERCENTAGE:
                discount = amount.multiply(coupon.getDiscountValue())
                        .divide(java.math.BigDecimal.valueOf(100));
                if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    discount = coupon.getMaxDiscountAmount();
                }
                break;
            case FIXED_AMOUNT:
                discount = coupon.getDiscountValue();
                break;
            case FREE_SHIPPING:
                // Handle free shipping logic if needed
                break;
        }
        return discount;
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
}
