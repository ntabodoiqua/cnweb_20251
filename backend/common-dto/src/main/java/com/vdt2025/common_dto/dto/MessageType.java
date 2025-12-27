package com.vdt2025.common_dto.dto;

import lombok.Getter;

@Getter
public enum MessageType {
    USER_CREATED("user.created", "welcome-email-queue"),
    USER_DISABLED("user.disabled", "user-disable-queue"),
    USER_DELETED("user.deleted", "user-delete-queue"),
    USER_SOFT_DELETED("user.soft.deleted", "user-soft-deleted-queue"),
    USER_HARD_DELETED("user.hard.deleted", "user-hard-deleted-queue"),
    PASSWORD_RESET("user.password.reset", "password-reset-queue"),
    EMAIL_VERIFICATION("user.email.verification", "email-verification-queue"),
    SELLER_PROFILE_APPROVED("seller.profile.approved", "seller-profile-approved-queue"),
    STORE_CREATED("store.created", "store-created-queue"),
    SELLER_PROFILE_REJECTED("seller.profile.rejected", "seller-profile-rejected-queue"),
    PAYMENT_SUCCESS("payment.success", "payment-success-queue"),
    PAYMENT_FAILED("payment.failed", "payment-failed-queue"),
    REFUND_SUCCESS("refund.success", "refund-success-queue"),
    REFUND_FAILED("refund.failed", "refund-failed-queue"),
    PRODUCT_CREATED("product.created", "product-created-queue"),
    PRODUCT_UPDATED("product.updated", "product-updated-queue"),
    PRODUCT_DELETED("product.deleted", "product-deleted-queue"),
    PRODUCT_STATUS_CHANGED("product.status.changed", "product-status-changed-queue"),
    
    // Order related notifications
    ORDER_CREATED("order.created", "order-created-queue"),
    ORDER_CONFIRMED("order.confirmed", "order-confirmed-queue"),
    ORDER_SHIPPED("order.shipped", "order-shipped-queue"),
    ORDER_DELIVERED("order.delivered", "order-delivered-queue"),
    ORDER_CANCELLED("order.cancelled", "order-cancelled-queue"),
    ORDER_RETURN_REQUESTED("order.return.requested", "order-return-requested-queue"),
    ORDER_RETURN_APPROVED("order.return.approved", "order-return-approved-queue"),
    ORDER_RETURN_REJECTED("order.return.rejected", "order-return-rejected-queue"),
    
    // Seller notifications for orders
    SELLER_NEW_ORDER("seller.new.order", "seller-new-order-queue");

    private final String routingKey;
    private final String queueName;

    MessageType(String routingKey, String queueName) {
        this.routingKey = routingKey;
        this.queueName = queueName;
    }
}