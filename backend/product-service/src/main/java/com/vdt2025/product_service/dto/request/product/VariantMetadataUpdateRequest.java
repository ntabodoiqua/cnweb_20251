package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO để cập nhật metadata của ProductVariant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantMetadataUpdateRequest {
    
    @NotNull(message = "Metadata cannot be null")
    Map<String, Object> metadata;
}
