package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request để tạo sản phẩm mới
 * Best practice cho e-commerce: validation đầy đủ, hỗ trợ variants
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreationRequest {

    @NotBlank(message = "PRODUCT_NAME_REQUIRED")
    @Size(min = 3, max = 255, message = "PRODUCT_NAME_INVALID_LENGTH")
    String name;

    @NotBlank(message = "PRODUCT_DESCRIPTION_REQUIRED")
    @Size(min = 10, max = 5000, message = "PRODUCT_DESCRIPTION_INVALID_LENGTH")
    String description;

    @Size(max = 500, message = "SHORT_DESCRIPTION_TOO_LONG")
    String shortDescription;

    @NotNull(message = "CATEGORY_ID_REQUIRED")
    String categoryId;
    @NotNull(message = "STORE_ID_REQUIRED")
    String storeId;

    String brandId; // Optional

    // Danh sách variants (nếu sản phẩm có nhiều biến thể)
    @Valid
    List<VariantCreationRequest> variants;
}
