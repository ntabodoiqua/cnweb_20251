package com.vdt2025.product_service.dto.request.attribute;

import com.vdt2025.product_service.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

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
    String name;

    String description;

    @NotNull
    List<String> categoryIds; // Danh sách ID của các danh mục áp dụng thuộc tính này

    @NotNull
    List<AttributeValueRequest> values; // Danh sách giá trị thuộc tính
}