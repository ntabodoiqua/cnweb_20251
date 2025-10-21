package com.cnweb2025.user_service.dto.request.otp;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResendOtpRequest {
    @NotBlank(message = "Username is required")
    String username;
}
