package com.cnweb.order_service.dto.response;

import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.enums.PaymentMethod;
import com.cnweb.order_service.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * OrderResponse - DTO cho order response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {

    String id;
    String orderNumber;
    String userId;
    String storeId;
    String storeName;

    // Thông tin người nhận
    String receiverName;
    String receiverPhone;
    String receiverEmail;
    String shippingAddress;
    String shippingProvince;
    String shippingDistrict;
    String shippingWard;

    // Thông tin giá cả
    BigDecimal subtotal;
    BigDecimal shippingFee;
    BigDecimal discountAmount;
    BigDecimal totalAmount;

    // Mã giảm giá
    String couponCode;
    String couponId;

    // Trạng thái
    OrderStatus status;
    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    String paymentTransactionId;

    // Ghi chú
    String note;
    String cancelReason;
    String cancelledBy;

    // Thời gian
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime confirmedAt;
    LocalDateTime shippedAt;
    LocalDateTime deliveredAt;
    LocalDateTime cancelledAt;

    // Items
    List<OrderItemResponse> items;
}
