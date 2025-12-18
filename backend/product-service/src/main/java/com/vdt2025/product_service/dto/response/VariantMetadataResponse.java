package com.vdt2025.product_service.dto.response;

import com.vdt2025.product_service.dto.SpecAttribute;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO cho metadata của ProductVariant
 * Trả về đầy đủ thông tin với đa ngôn ngữ để FE có thể hiển thị
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantMetadataResponse {
    
    String variantId;
    String productId;
    
    /**
     * Map của các metadata attributes với đầy đủ thông tin i18n
     * Key: metadata key (VD: "color", "size")
     * Value: SpecAttribute object chứa value, labels, dataType, unit, etc.
     */
    Map<String, SpecAttribute> metadata;
}
