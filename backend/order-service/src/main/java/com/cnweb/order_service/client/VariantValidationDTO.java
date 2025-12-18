package com.cnweb.order_service.client;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Variant validation DTO for internal service communication
 * Mirrors com.vdt2025.product_service.dto.response.VariantValidationDTO
 */
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
