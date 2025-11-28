package com.cnweb2025.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user_id", columnList = "userId"),
    @Index(name = "idx_notification_created_at", columnList = "createdAt"),
    @Index(name = "idx_notification_is_read", columnList = "isRead")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(length = 36)
    String id;
    
    @Column(nullable = false)
    String userId;
    
    @Column(nullable = false)
    String title;
    
    @Column(length = 1000)
    String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationType type;
    
    @Column(length = 500)
    String link;
    
    @Column(length = 500)
    String imageUrl;
    
    @Column(nullable = false)
    @Builder.Default
    Boolean isRead = false;
    
    @Column(nullable = false)
    LocalDateTime createdAt;
    
    LocalDateTime readAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
