package com.cnweb2025.notification_service.entity;

import lombok.Getter;

@Getter
public enum NotificationType {
    // Order related
    ORDER_PLACED("Đơn hàng mới", "shopping-cart"),
    ORDER_CONFIRMED("Xác nhận đơn hàng", "check-circle"),
    ORDER_SHIPPED("Đơn hàng đang giao", "truck"),
    ORDER_DELIVERED("Giao hàng thành công", "gift"),
    ORDER_CANCELLED("Đơn hàng đã hủy", "close-circle"),

    // Payment related
    PAYMENT_SUCCESS("Thanh toán thành công", "dollar"),
    PAYMENT_FAILED("Thanh toán thất bại", "warning"),
    REFUND_SUCCESS("Hoàn tiền thành công", "undo"),
    REFUND_FAILED("Hoàn tiền thất bại", "warning"),

    // User related
    ACCOUNT_VERIFIED("Xác thực tài khoản", "safety"),
    PASSWORD_CHANGED("Đổi mật khẩu", "lock"),
    PROFILE_UPDATED("Cập nhật hồ sơ", "user"),

    // Seller related
    SELLER_APPROVED("Duyệt hồ sơ bán hàng", "shop"),
    SELLER_REJECTED("Từ chối hồ sơ bán hàng", "close-circle"),
    STORE_CREATED("Cửa hàng được tạo", "shop"),
    NEW_ORDER("Đơn hàng mới cho cửa hàng", "shopping"),

    // Product related
    PRODUCT_OUT_OF_STOCK("Sản phẩm hết hàng", "inbox"),
    PRODUCT_LOW_STOCK("Sản phẩm sắp hết", "warning"),
    NEW_REVIEW("Đánh giá mới", "star"),

    // Promotion related
    PROMOTION("Khuyến mãi", "tag"),
    COUPON_RECEIVED("Nhận mã giảm giá", "gift"),

    // System
    SYSTEM("Thông báo hệ thống", "notification"),
    INFO("Thông tin", "info-circle");

    private final String displayName;
    private final String icon;

    NotificationType(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }
}