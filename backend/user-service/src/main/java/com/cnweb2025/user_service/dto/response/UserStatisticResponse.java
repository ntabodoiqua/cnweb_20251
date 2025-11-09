package com.cnweb2025.user_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatisticResponse {
    // Tổng số người dùng
    long totalUsers;

    // Người dùng đang hoạt động
    long activeUsers;

    // Người dùng bị khóa
    long disabledUsers;

    // Số lượng user theo vai trò
    Map<String, Long> usersByRole;

    // Số lượng user đăng ký theo tháng
    Map<String, Long> usersByMonth;
}
