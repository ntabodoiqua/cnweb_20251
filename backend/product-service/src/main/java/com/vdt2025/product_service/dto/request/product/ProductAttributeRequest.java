package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request để tạo thuộc tính sản phẩm (specifications)
 * Ví dụ: Chất liệu: Cotton, Xuất xứ: Việt Nam
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductAttributeRequest {
    
    @NotBlank(message = "ATTRIBUTE_NAME_REQUIRED")
    String attributeName;
    
    @NotBlank(message = "ATTRIBUTE_VALUE_REQUIRED")
    String attributeValue;
}
