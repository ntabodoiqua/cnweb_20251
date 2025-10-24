package com.cnweb2025.user_service.dto.response;

import com.cnweb2025.user_service.enums.SigninStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginHistoryResponse {
    String id;
    String userId;
    LocalDateTime loginTime;
    String ipAddress;
    String userAgent;
    SigninStatus status;
}
