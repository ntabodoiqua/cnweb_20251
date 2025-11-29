package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderEvent {
    String orderId;
    String orderNumber;
    String username;
    String email;
    String storeId;
    String storeName;
    String storeOwnerUsername; // Username của seller (để gửi notification)
    BigDecimal totalAmount;
    String status;
    String shippingAddress;
    String receiverName;
    String receiverPhone;
    LocalDateTime createdAt;
    LocalDateTime eventTime;
    String cancelReason;
    String cancelledBy;
    String returnReason;
    String refundStatus;
    BigDecimal refundAmount;
    List<OrderItemEvent> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OrderItemEvent {
        String productId;
        String productName;
        String variantName;
        String productImage;
        BigDecimal price;
        Integer quantity;
    }
}
