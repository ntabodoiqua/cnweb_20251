package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response chứa thông tin variant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantResponse {

    String id;

    String sku;

    String variantName;

    BigDecimal price;

    BigDecimal originalPrice;

    Integer stockQuantity;

    Integer soldQuantity;

    String imageName;

    String imageUrl;

    BigDecimal weight;

    boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    // Danh sách thuộc tính của variant (màu sắc, kích thước, etc.)
    List<AttributeValueResponse> attributeValues;
}