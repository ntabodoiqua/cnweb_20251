package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Response cho thuộc tính sản phẩm (specifications)
 * Ví dụ: Chất liệu: Cotton
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductAttributeResponse {
    
    String id;
    
    String attributeName;
    
    String attributeValue;
}
