package com.cnweb20251.message_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Feign client để gọi Order Service.
 * Sử dụng internal API để lấy thông tin đơn hàng (service-to-service communication).
 */
@FeignClient(name = "order-service", path = "/internal/orders")
public interface OrderServiceClient {

    /**
     * Lấy thông tin đơn hàng theo ID (internal endpoint).
     */
    @GetMapping("/{orderId}")
    ApiResponse<OrderInfo> getOrderInfo(@PathVariable("orderId") String orderId);

    /**
     * DTO cho thông tin đơn hàng - khớp với OrderResponse trong order-service.
     */
    record OrderInfo(
        String id,
        String orderNumber,
        String username,
        String storeId,
        String storeName,
        // Thông tin người nhận
        String receiverName,
        String receiverPhone,
        String receiverEmail,
        String shippingAddress,
        String shippingProvince,
        String shippingWard,
        // Thông tin giá cả
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        // Mã giảm giá
        String couponCode,
        String couponId,
        // Trạng thái
        String status,
        String paymentMethod,
        String paymentStatus,
        String paymentTransactionId,
        // Ghi chú
        String note,
        String cancelReason,
        String cancelledBy,
        // Thời gian
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime confirmedAt,
        LocalDateTime paidAt,
        LocalDateTime cancelledAt,
        LocalDateTime shippingAt,
        LocalDateTime deliveredAt,
        // Items
        List<OrderItemInfo> items
    ) {}

    /**
     * DTO cho item trong đơn hàng - khớp với OrderItemResponse.
     */
    record OrderItemInfo(
        String id,
        String storeId,
        String storeName,
        String productId,
        String productName,
        String variantId,
        String variantName,
        String sku,
        String productImage,
        BigDecimal price,
        Integer quantity,
        BigDecimal totalPrice
    ) {}
}
