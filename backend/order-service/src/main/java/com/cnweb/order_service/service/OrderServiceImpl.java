package com.cnweb.order_service.service;

import com.cnweb.order_service.client.*;
import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.request.OrderItemRequest;
import com.cnweb.order_service.dto.response.CouponResponse;
import com.cnweb.order_service.dto.response.CouponValidationResponse;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
import com.cnweb.order_service.enums.DiscountType;
import com.cnweb.order_service.mapper.OrderMapper;
import com.cnweb.order_service.repository.OrderRepository;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    OrderMapper orderMapper;
    CouponService couponService;

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
            String storeName = variantMap.get(storeItems.get(0).getVariantId()).getStoreName();

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

        // 4. Apply Coupon Logic
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            applyCoupon(username, request.getCouponCode(), createdOrders);
        }

        // 5. Reserve stock
        productClient.reserveBatch(BatchInventoryChangeRequest.builder()
                .items(inventoryChanges)
                .build());

        // 6. Save orders
        orderRepository.saveAll(createdOrders);

        // 7. Record Coupon Usage (if applied)
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
             // Only record usage if discount was actually applied to at least one order
             boolean couponApplied = createdOrders.stream()
                     .anyMatch(o -> o.getDiscountAmount() != null && o.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0);
             
             if (couponApplied) {
                 // Use the first order ID for tracking
                 couponService.useCoupon(createdOrders.get(0).getCouponId(), username, createdOrders.get(0).getId());
             }
        }

        // 8. Map to response
        return createdOrders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
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
