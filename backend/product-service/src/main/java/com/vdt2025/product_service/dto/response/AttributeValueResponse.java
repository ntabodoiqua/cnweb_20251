package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

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

    String value; // Ví dụ: "Trắng", "L"
    
    String attributeId; // ID của ProductAttribute (Màu sắc, Size, ...)
    
    String attributeName; // Tên của attribute (Màu sắc, Size, ...)

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

}
