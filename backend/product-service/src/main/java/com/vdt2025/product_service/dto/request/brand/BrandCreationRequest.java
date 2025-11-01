package com.vdt2025.product_service.dto.request.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandCreationRequest {
    @NotBlank(message = "BRAND_NAME_REQUIRED")
    String name;
    String description;
    String logoName;
}
