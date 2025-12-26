package com.cnweb.order_service.enums;

public enum OrderStatus {
    PENDING,        // Chờ xác nhận
    PAID,           // Đã thanh toán
    CONFIRMED,      // Đã xác nhận
    SHIPPING,       // Đang giao hàng
    DELIVERED,      // Đã giao hàng
    CANCELLED,      // Đã hủy
    RETURNED        // Đã trả hàng
}