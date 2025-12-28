package com.cnweb2025.user_service.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO để xác nhận xóa tài khoản với OTP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeleteAccountRequest {
    
    @NotBlank(message = "OTP code is required")
    String otpCode;
    
    String reason; // Lý do xóa tài khoản (optional)
}
