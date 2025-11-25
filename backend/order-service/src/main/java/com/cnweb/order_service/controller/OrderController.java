package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.request.OrderFilterRequest;
import com.cnweb.order_service.dto.response.OrderPaymentResponse;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.service.OrderService;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Order", description = "Order management APIs")
public class OrderController {

    private final OrderService orderService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())
                && authentication.getPrincipal() instanceof Jwt) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }

    @PostMapping
    @Operation(summary = "Create order", description = "Create new order(s) from cart items. If items belong to multiple shops, multiple orders will be created.")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> createOrder(@Valid @RequestBody OrderCreationRequest request) {
        String username = getCurrentUsername();
        List<OrderResponse> response = orderService.createOrder(username, request);
        
        return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .code(201)
                .message("Orders created successfully")
                .result(response)
                .build());
    }

    @PostMapping("/apply-coupon")
    @Operation(summary = "Apply coupon to orders", description = "Apply a coupon code to a list of existing orders.")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> applyCoupon(
            @RequestParam String couponCode,
            @RequestBody List<String> orderIds) {
        String username = getCurrentUsername();
        List<OrderResponse> response = orderService.applyCouponToOrders(username, couponCode, orderIds);
        
        return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .code(200)
                .message("Coupon applied successfully")
                .result(response)
                .build());
    }

    @PostMapping("/payment")
    @Operation(summary = "Initiate payment", description = "Initiate payment for a list of orders.")
    public ResponseEntity<ApiResponse<OrderPaymentResponse>> initiatePayment(
            @RequestBody @Valid com.cnweb.order_service.dto.request.OrderPaymentRequest request) {
        String username = getCurrentUsername();
        OrderPaymentResponse response = orderService.initiatePayment(username, request);

        return ResponseEntity.ok(ApiResponse.<OrderPaymentResponse>builder()
                .code(200)
                .message("Payment initiated successfully")
                .result(response)
                .build());
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get my orders", description = "Get list of orders for current user with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @ModelAttribute OrderFilterRequest filter,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        String username = getCurrentUsername();
        Page<OrderResponse> response = orderService.getMyOrders(username, filter, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<OrderResponse>>builder()
                .code(200)
                .message("Orders retrieved successfully")
                .result(response)
                .build());
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get store orders", description = "Get list of orders for a specific store with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getStoreOrders(
            @PathVariable String storeId,
            @ModelAttribute OrderFilterRequest filter,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        String username = getCurrentUsername();
        Page<OrderResponse> response = orderService.getStoreOrders(username, storeId, filter, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<OrderResponse>>builder()
                .code(200)
                .message("Store orders retrieved successfully")
                .result(response)
                .build());
    }
}
