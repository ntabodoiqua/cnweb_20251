package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.mapper.OrderMapper;
import com.cnweb.order_service.repository.OrderRepository;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal Controller cho Order Service
 * Được gọi bởi các service khác (product-service, message-service) thông qua Feign Client
 */
@RestController
@RequestMapping("/internal/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Internal Order", description = "Internal APIs for inter-service communication")
public class InternalOrderController {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    /**
     * Lấy thông tin đơn hàng theo ID (internal - không kiểm tra authorization)
     * GET /internal/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", description = "Get order information by ID for internal service calls")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable String orderId) {
        log.info("Internal: Fetching order info for ID: {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElse(null);
        
        if (order == null) {
            return ApiResponse.<OrderResponse>builder()
                    .result(null)
                    .message("Order not found")
                    .build();
        }
        
        return ApiResponse.<OrderResponse>builder()
                .result(orderMapper.toOrderResponse(order))
                .build();
    }

    /**
     * Kiểm tra user đã mua sản phẩm (đơn hàng đã DELIVERED) chưa
     * GET /internal/orders/verify-purchase
     */
    @GetMapping("/verify-purchase")
    @Operation(summary = "Verify purchase", description = "Check if user has purchased and received a product")
    public ApiResponse<Boolean> verifyPurchase(
            @RequestParam String username,
            @RequestParam String productId) {
        log.info("Internal: Verifying purchase for user {} and product {}", username, productId);

        boolean hasPurchased = orderRepository.existsByUsernameAndProductIdAndStatus(
                username, productId, OrderStatus.DELIVERED);

        return ApiResponse.<Boolean>builder()
                .result(hasPurchased)
                .message(hasPurchased ? "User has purchased this product" : "User has not purchased this product")
                .build();
    }

    /**
     * Lấy orderId của đơn hàng DELIVERED chứa sản phẩm
     * GET /internal/orders/delivered-order-id
     */
    @GetMapping("/delivered-order-id")
    @Operation(summary = "Get delivered order ID", description = "Get the order ID of a delivered order containing the product")
    public ApiResponse<String> getDeliveredOrderId(
            @RequestParam String username,
            @RequestParam String productId) {
        log.info("Internal: Getting delivered order ID for user {} and product {}", username, productId);

        List<String> orderIds = orderRepository.findOrderIdsByUsernameAndProductIdAndStatus(
                username, productId, OrderStatus.DELIVERED);

        String orderId = orderIds.isEmpty() ? null : orderIds.get(0);

        return ApiResponse.<String>builder()
                .result(orderId)
                .build();
    }
}
