package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response cho thuộc tính sản phẩm (specifications)
 * Ví dụ: Chất liệu, Xuất xứ, Màu sắc, ...
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductAttributeResponse {
    
    String id;
    
    String name;

    String description;

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    List<CategoryResponse> categories;

    List<AttributeValueResponse> values;
}
