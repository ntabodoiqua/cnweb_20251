package com.cnweb20251.message_service.enums;

/**
 * Enum trạng thái của tin nhắn.
 */
public enum MessageStatus {
    SENDING,    // Đang gửi
    SENT,       // Đã gửi
    DELIVERED,  // Đã chuyển đến
    READ,       // Đã đọc
    FAILED      // Gửi thất bại
}
