package com.cnweb.order_service.enums;

public enum PaymentStatus {
    UNPAID,         // Chưa thanh toán
    PENDING,        // Đang xử lý thanh toán
    PAID,           // Đã thanh toán
    FAILED,         // Thanh toán thất bại
    REFUNDED        // Đã hoàn tiền
}
