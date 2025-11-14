package com.cnweb2025.user_service.dto.response;

import com.cnweb2025.user_service.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

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
    String avatarUrl;
    Boolean enabled;
    Boolean isVerified;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Set<RoleResponse> roles;
    Set<AddressResponse> addresses;
    Gender gender;
    SellerProfileResponse sellerProfile;
}
