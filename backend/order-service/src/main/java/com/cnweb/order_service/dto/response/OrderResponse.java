package com.cnweb.order_service.dto.response;

import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.enums.PaymentMethod;
import com.cnweb.order_service.enums.PaymentStatus;
import com.cnweb.order_service.enums.RefundStatus;
import com.cnweb.order_service.enums.ReturnReason;
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
    String username;
    String storeId;
    String storeName;

    // Thông tin người nhận
    String receiverName;
    String receiverPhone;
    String receiverEmail;
    String shippingAddress;
    String shippingProvince;
    String shippingWard;

    // Thông tin giá cả
    BigDecimal subtotal;
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

    // Return/Refund info
    ReturnReason returnReason;
    String returnDescription;
    List<String> returnImages;
    LocalDateTime returnRequestedAt;
    LocalDateTime returnProcessedAt;
    String returnProcessedBy;
    String returnRejectionReason;
    RefundStatus refundStatus;
    BigDecimal refundAmount;
    String refundTransactionId;
    LocalDateTime refundedAt;
    LocalDateTime returnedAt;

    // Flags for UI
    Boolean canBeReturned;
    Boolean canProcessReturn;

    // Thời gian
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime confirmedAt;
    LocalDateTime paidAt;
    LocalDateTime cancelledAt;
    LocalDateTime shippingAt;
    LocalDateTime deliveredAt;

    // Items
    List<OrderItemResponse> items;
}
