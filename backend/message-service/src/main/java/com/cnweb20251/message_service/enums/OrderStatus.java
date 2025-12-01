package com.cnweb20251.message_service.enums;

/**
 * Enum trạng thái đơn hàng.
 * Đồng bộ với order-service.
 */
public enum OrderStatus {
    PENDING,        // Chờ xác nhận
    PAID,           // Đã thanh toán
    CONFIRMED,      // Đã xác nhận
    SHIPPING,       // Đang giao hàng
    DELIVERED,      // Đã giao hàng
    CANCELLED,      // Đã hủy
    RETURNED        // Đã trả hàng
}
