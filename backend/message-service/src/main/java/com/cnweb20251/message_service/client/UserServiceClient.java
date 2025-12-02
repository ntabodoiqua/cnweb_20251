package com.cnweb20251.message_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Feign client để gọi User Service.
 */
@FeignClient(name = "user-service", path = "/users")
public interface UserServiceClient {

    /**
     * Lấy thông tin profile của user theo username (internal endpoint).
     */
    @GetMapping("/internal/{username}")
    ApiResponse<UserProfile> getUserProfile(@PathVariable("username") String username);

    /**
     * DTO cho user profile - phải khớp với UserResponse trong user-service.
     */
    record UserProfile(
        String id,
        String username,
        String firstName,
        String lastName,
        LocalDate dob,
        String phone,
        String email,
        String avatarName,
        String avatarUrl,
        Boolean enabled,
        Boolean isVerified,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Set<RoleInfo> roles,
        String gender
    ) {
        /**
         * Helper method để lấy full name.
         */
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

    /**
     * DTO cho role.
     */
    record RoleInfo(
        String name,
        String description
    ) {}
}
