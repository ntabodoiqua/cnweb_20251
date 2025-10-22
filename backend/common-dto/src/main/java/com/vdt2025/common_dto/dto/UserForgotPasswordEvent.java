package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserForgotPasswordEvent {
    String id;
    String email;
    String username;
    String otpCode;
}
