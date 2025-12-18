package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantValidationDTO {
    String variantId;
    boolean isDeleted;
    boolean isActive;
    boolean inStock;
    Integer availableStock;
    String message;
}
