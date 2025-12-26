package com.cnweb2025.notification_service.dto;

import com.cnweb2025.notification_service.entity.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateNotificationRequest {
    String userId;
    String title;
    String message;
    NotificationType type;
    String link;
    String imageUrl;
}