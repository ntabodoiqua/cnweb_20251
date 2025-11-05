package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Response cho giá trị thuộc tính của variant
 * Ví dụ: Màu Trắng, Size L
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttributeValueResponse {
    
    String id;
    
    String attributeName; // Ví dụ: "Màu sắc", "Kích thước"
    
    String value; // Ví dụ: "Trắng", "L"
}
