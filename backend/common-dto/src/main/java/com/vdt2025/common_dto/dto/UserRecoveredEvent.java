package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Event khi user khôi phục tài khoản trong grace period
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRecoveredEvent {
    String id;
    String username;
    String email;
    LocalDateTime recoveredAt;
}
