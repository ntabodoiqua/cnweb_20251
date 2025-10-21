package com.cnweb2025.user_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    LocalDate dob;
    String phone;
    String email;
    String avatarName;
    boolean enabled;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    RoleResponse role;
}
