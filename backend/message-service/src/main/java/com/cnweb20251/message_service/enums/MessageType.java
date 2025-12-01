package com.cnweb20251.message_service.enums;

public enum MessageType {

    /**
     * Tin nhắn văn bản thông thường.
     */
    TEXT,

    /**
     * Tin nhắn chứa hình ảnh.
     */
    IMAGE,

    /**
     * Tin nhắn chứa nhiều hình ảnh.
     */
    IMAGES,

    /**
     * Tin nhắn chứa thông tin sản phẩm từ product-service.
     */
    PRODUCT,

    /**
     * Tin nhắn chứa thông tin đơn hàng từ order-service.
     */
    ORDER,

    /**
     * Tin nhắn hệ thống (thông báo tự động).
     */
    SYSTEM,

    /**
     * Tin nhắn chứa file đính kèm.
     */
    FILE,

    /**
     * Tin nhắn chứa emoji/sticker.
     */
    STICKER,

    /**
     * Tin nhắn kết hợp nhiều loại nội dung.
     */
    MIXED
}
