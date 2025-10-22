package com.cnweb2025.user_service.dto.request.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAddressCreationRequest {
    @NotBlank(message = "MISSING_RECEIVER_NAME")
    String receiverName;
    @NotBlank(message = "MISSING_RECEIVER_PHONE")
    String receiverPhone;
    @NotBlank(message = "MISSING_STREET")
    String street;
    @NotNull(message = "MISSING_WARD_ID")
    Integer wardId;
    @NotNull(message = "MISSING_PROVINCE_ID")
    Integer provinceId;
    Boolean isDefault;
}
