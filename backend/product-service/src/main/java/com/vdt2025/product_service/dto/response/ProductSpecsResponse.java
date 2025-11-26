package com.vdt2025.product_service.dto.response;

import com.vdt2025.product_service.dto.SpecAttribute;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO cho thông tin đặc tả kỹ thuật (specs) của Product
 * Trả về đầy đủ thông tin với đa ngôn ngữ để FE có thể hiển thị
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSpecsResponse {
    
    String productId;
    
    /**
     * Map của các spec attributes với đầy đủ thông tin i18n
     * Key: spec key (VD: "stereoSpeakers")
     * Value: SpecAttribute object chứa value, labels, dataType, unit, etc.
     */
    Map<String, SpecAttribute> specs;
}
