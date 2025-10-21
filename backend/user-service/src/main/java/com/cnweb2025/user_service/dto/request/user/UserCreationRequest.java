package com.cnweb2025.user_service.dto.request.user;

import com.cnweb2025.user_service.validator.DobConstrain;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @NotBlank(message = "MISSING_USERNAME")
    @Size(min = 3, message = "USERNAME_INVALID")
    String username;

    @NotBlank(message = "MISSING_PASSWORD")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    String firstName;
    String lastName;

    @DobConstrain(min = 16, message = "INVALID_DOB")
    LocalDate dob;

    @Email(message = "INVALID_EMAIL")
    String email;

    @Pattern(regexp = "^(0[0-9]{9})$", message = "INVALID_PHONE")
    String phone;
}
