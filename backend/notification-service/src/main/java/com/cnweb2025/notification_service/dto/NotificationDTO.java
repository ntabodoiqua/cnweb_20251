package com.cnweb2025.notification_service.dto;

import com.cnweb2025.notification_service.entity.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationDTO {
    String id;
    String userId;
    String title;
    String message;
    NotificationType type;
    String link;
    String imageUrl;
    Boolean isRead;
    LocalDateTime createdAt;
    LocalDateTime readAt;
    
    // Thêm thông tin icon từ NotificationType
    String icon;
    String typeDisplayName;
}
