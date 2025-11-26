package com.vdt2025.product_service.dto.request.product;

import com.vdt2025.product_service.dto.SpecAttribute;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO để cập nhật metadata của ProductVariant
 * Support structured metadata với đa ngôn ngữ (i18n) tương tự ProductSpecs
 * 
 * Example payload:
 * {
 *   "metadata": {
 *     "color": {
 *       "key": "color",
 *       "value": "Red",
 *       "labelEn": "Color",
 *       "labelVi": "Màu sắc",
 *       "dataType": "string"
 *     }
 *   }
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantMetadataUpdateRequest {
    
    /**
     * Map của các metadata attributes
     * Key: metadata key (VD: "color", "size")
     * Value: SpecAttribute object chứa đầy đủ thông tin
     */
    @NotNull(message = "Metadata cannot be null")
    @Valid
    Map<String, SpecAttribute> metadata;
}
