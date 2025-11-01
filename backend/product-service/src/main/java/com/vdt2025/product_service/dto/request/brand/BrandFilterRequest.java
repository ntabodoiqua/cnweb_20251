package com.vdt2025.product_service.dto.request.brand;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandFilterRequest {
    String name;
    Boolean isActive;
}
