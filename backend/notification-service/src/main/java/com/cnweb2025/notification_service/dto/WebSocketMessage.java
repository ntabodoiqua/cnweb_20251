package com.cnweb2025.notification_service.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebSocketMessage {
    String type; // NOTIFICATION, UNREAD_COUNT, CONNECTION
    Object payload;
    long timestamp;

    public static WebSocketMessage notification(NotificationDTO notification) {
        return WebSocketMessage.builder()
                .type("NOTIFICATION")
                .payload(notification)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WebSocketMessage unreadCount(long count) {
        return WebSocketMessage.builder()
                .type("UNREAD_COUNT")
                .payload(count)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WebSocketMessage connected() {
        return WebSocketMessage.builder()
                .type("CONNECTED")
                .payload("Successfully connected to notification service")
                .timestamp(System.currentTimeMillis())
                .build();
    }
}