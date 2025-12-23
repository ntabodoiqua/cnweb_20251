package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.request.CancelOrderRequest;
import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.request.OrderFilterRequest;
import com.cnweb.order_service.dto.request.ProcessReturnRequest;
import com.cnweb.order_service.dto.request.ReturnOrderRequest;
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

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", description = "Get order details by ID (for customer or seller)")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String orderId) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.getOrderById(username, orderId);

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message("Order retrieved successfully")
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

    @GetMapping("/admin")
    @Operation(summary = "Get all orders (admin)", description = "Get list of all orders with filtering and pagination for admin users")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrdersForAdmin(
            @ModelAttribute OrderFilterRequest filter,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OrderResponse> response = orderService.getAllOrdersForAdmin(filter, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<OrderResponse>>builder()
                .code(200)
                .message("All orders retrieved successfully")
                .result(response)
                .build());
    }

    // ==================== Order Status Management ====================

    @PutMapping("/{orderId}/confirm")
    @Operation(summary = "Confirm order (Seller)", description = "Seller confirms the order after payment. Changes status from PAID to CONFIRMED.")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable String orderId) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.confirmOrder(username, orderId);

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message("Order confirmed successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{orderId}/ship")
    @Operation(summary = "Ship order (Seller)", description = "Seller marks the order as shipping. Changes status from CONFIRMED to SHIPPING.")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(@PathVariable String orderId) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.shipOrder(username, orderId);

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message("Order is now shipping")
                .result(response)
                .build());
    }

    @PutMapping("/{orderId}/deliver")
    @Operation(summary = "Confirm delivery (Customer)", description = "Customer confirms they have received the order. Changes status from SHIPPING to DELIVERED.")
    public ResponseEntity<ApiResponse<OrderResponse>> deliverOrder(@PathVariable String orderId) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.deliverOrder(username, orderId);

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message("Order delivered successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel an order. Can be done by customer or seller when order is PENDING or PAID.")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable String orderId,
            @Valid @RequestBody CancelOrderRequest request) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.cancelOrder(username, orderId, request.getCancelReason());

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message("Order cancelled successfully")
                .result(response)
                .build());
    }

    // ==================== Return & Refund Management ====================

    @PostMapping("/{orderId}/return")
    @Operation(summary = "Request return (Customer)",
            description = "Customer requests to return an order after delivery. Can only be done within 7 days of delivery.")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable String orderId,
            @Valid @RequestBody ReturnOrderRequest request) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.requestReturn(username, orderId, request);

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message("Return request submitted successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{orderId}/return/process")
    @Operation(summary = "Process return request (Seller)",
            description = "Seller approves or rejects a return request. If approved, order status changes to RETURNED and refund is processed.")
    public ResponseEntity<ApiResponse<OrderResponse>> processReturn(
            @PathVariable String orderId,
            @Valid @RequestBody ProcessReturnRequest request) {
        String username = getCurrentUsername();
        OrderResponse response = orderService.processReturn(username, orderId, request);

        String message = request.getApproved()
                ? "Return approved and refund initiated"
                : "Return request rejected";

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .code(200)
                .message(message)
                .result(response)
                .build());
    }

    @GetMapping("/store/{storeId}/pending-returns")
    @Operation(summary = "Get pending return orders (Seller)",
            description = "Get list of orders with pending return requests for a specific store.")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getPendingReturnOrders(
            @PathVariable String storeId,
            @PageableDefault(sort = "returnRequestedAt", direction = Sort.Direction.ASC) Pageable pageable) {
        String username = getCurrentUsername();
        Page<OrderResponse> response = orderService.getPendingReturnOrders(username, storeId, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<OrderResponse>>builder()
                .code(200)
                .message("Pending return orders retrieved successfully")
                .result(response)
                .build());
    }
}