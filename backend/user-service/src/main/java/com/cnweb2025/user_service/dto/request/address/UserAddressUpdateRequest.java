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
public class UserAddressUpdateRequest {
    String receiverName;
    String receiverPhone;
    String street;
    Integer wardId;
    Integer provinceId;
    Boolean isDefault;
}
