package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Event khi user bị xóa vĩnh viễn (hard delete)
 * Được gửi qua RabbitMQ để các services khác cleanup dữ liệu liên quan
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDeletedEvent {
    String id;
    String username;
    String email;
    LocalDateTime deletedAt;
    boolean isAdminAction; // True nếu Admin xóa, false nếu scheduled job xóa
}
