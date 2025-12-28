package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Event khi user yêu cầu xóa tài khoản
 * Được gửi qua RabbitMQ để thông báo cho các services khác
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDeletionRequestedEvent {
    String id;
    String username;
    String email;
    String firstName;
    String lastName;
    LocalDateTime deletionRequestedAt;
    LocalDateTime scheduledDeletionAt; // Thời điểm dự kiến xóa (sau 30 ngày)
    String reason;
}
