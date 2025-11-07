package com.vdt2025.product_service.dto.request.attribute;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductAttributeCategoryUpdateRequest {
    List<String> categoryIds; // Danh sách ID của các danh mục áp dụng thuộc tính này
}
