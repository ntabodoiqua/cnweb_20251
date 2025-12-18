package com.cnweb2025.user_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Response DTO đơn giản cho thông tin user
 * Sử dụng cho internal service-to-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInfoSimpleResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    String avatarUrl;
    
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return username;
    }
}
