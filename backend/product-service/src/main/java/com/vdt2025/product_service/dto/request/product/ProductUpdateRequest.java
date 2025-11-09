package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request để cập nhật thông tin sản phẩm
 */
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {

    @Size(min = 3, max = 255, message = "PRODUCT_NAME_INVALID_LENGTH")
    String name;

    @Size(min = 10, max = 5000, message = "PRODUCT_DESCRIPTION_INVALID_LENGTH")
    String description;

    @Size(max = 500, message = "SHORT_DESCRIPTION_TOO_LONG")
    String shortDescription;

    String categoryId;

    List<String> storeCategoryIds;

    String brandId;

    @Min(value = 0, message = "WEIGHT_MUST_BE_POSITIVE")
    BigDecimal weight;

    Boolean isActive;
}