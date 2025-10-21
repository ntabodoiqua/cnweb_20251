package com.cnweb2025.user_service.dto.request.user;

import com.cnweb2025.user_service.validator.DobConstrain;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String firstName;
    String lastName;
    String email;
    @DobConstrain(min = 16, message = "INVALID_DOB")
    LocalDate dob;
    String phone;
    String avatarName;
}
