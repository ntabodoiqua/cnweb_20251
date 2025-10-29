package com.vdt2025.common_dto.dto;

import lombok.Getter;

@Getter
public enum MessageType {
    USER_CREATED("user.created", "welcome-email-queue"),
    USER_DISABLED("user.disabled", "user-disable-queue"),
    USER_DELETED("user.deleted", "user-delete-queue"),
    PASSWORD_RESET("user.password.reset", "password-reset-queue"),
    EMAIL_VERIFICATION("user.email.verification", "email-verification-queue"),
    SELLER_PROFILE_APPROVED("seller.profile.approved", "seller-profile-approved-queue"),
    STORE_CREATED("store.created", "store-created-queue"),
    SELLER_PROFILE_REJECTED("seller.profile.rejected", "seller-profile-rejected-queue"),
    PAYMENT_SUCCESS("payment.success", "payment-success-queue"),
    PAYMENT_FAILED("payment.failed", "payment-failed-queue");

    private final String routingKey;
    private final String queueName;

    MessageType(String routingKey, String queueName) {
        this.routingKey = routingKey;
        this.queueName = queueName;
    }
}