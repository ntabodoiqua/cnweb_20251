package com.cnweb.order_service.enums;

public enum OrderStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    CANCELLED,      // Đã hủy
    RETURNED        // Đã trả hàng
}