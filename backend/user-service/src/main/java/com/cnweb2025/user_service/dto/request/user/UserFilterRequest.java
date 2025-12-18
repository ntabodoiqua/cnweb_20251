package com.cnweb2025.user_service.dto.request.user;

import com.cnweb2025.user_service.entity.Role;
import com.cnweb2025.user_service.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserFilterRequest {
    String username;
    String firstName;
    String lastName;
    Boolean enabled;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime createdFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime createdTo;

    String role;
    Gender gender;
}
