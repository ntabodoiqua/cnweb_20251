package com.vdt2025.product_service.dto.request.product;

import com.vdt2025.product_service.dto.SpecAttribute;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO để cập nhật thông tin đặc tả kỹ thuật (specs) của Product
 * Support structured specs với đa ngôn ngữ (i18n)
 * 
 * Example payload:
 * {
 *   "specs": {
 *     "stereoSpeakers": {
 *       "key": "stereoSpeakers",
 *       "value": "yes",
 *       "labelEn": "Stereo Speakers",
 *       "labelVi": "Loa Stereo",
 *       "dataType": "boolean"
 *     }
 *   }
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSpecsUpdateRequest {
    
    /**
     * Map của các spec attributes
     * Key: spec key (VD: "stereoSpeakers")
     * Value: SpecAttribute object chứa đầy đủ thông tin
     */
    @NotNull(message = "Specs cannot be null")
    @Valid
    Map<String, SpecAttribute> specs;
}
