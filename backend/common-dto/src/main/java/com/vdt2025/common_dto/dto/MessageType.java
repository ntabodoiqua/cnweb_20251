package com.vdt2025.common_dto.dto;

import lombok.Getter;

@Getter
public enum MessageType {
    USER_CREATED("user.created", "welcome-email-queue"),
    USER_DELETED("user.deleted", "user-delete-queue"),
    PASSWORD_RESET("user.password.reset", "password-reset-queue"),
    EMAIL_VERIFICATION("user.email.verification", "email-verification-queue");

    private final String routingKey;
    private final String queueName;

    MessageType(String routingKey, String queueName) {
        this.routingKey = routingKey;
        this.queueName = queueName;
    }
}