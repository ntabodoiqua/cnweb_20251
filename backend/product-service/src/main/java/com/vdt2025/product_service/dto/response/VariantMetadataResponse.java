package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO cho metadata của ProductVariant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantMetadataResponse {
    
    String variantId;
    String productId;
    Map<String, Object> metadata;
}
