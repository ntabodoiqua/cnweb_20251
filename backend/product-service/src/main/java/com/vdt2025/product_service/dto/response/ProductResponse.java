package com.vdt2025.product_service.dto.response;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response chứa thông tin chi tiết sản phẩm
 * Best practice: bao gồm đầy đủ thông tin cho e-commerce
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {

    String id;

    String name;

    String description;

    String shortDescription;

    // Thống kê
    Long viewCount;

    Integer soldCount;

    Double averageRating;

    Integer ratingCount;

    boolean isActive;

    // Relationship responses
    CategoryResponse category;

    StoreResponse store;

    BrandResponse brand;

    // Danh sách variants
    List<VariantResponse> variants;

    // Danh sách ảnh
    List<ProductImageResponse> images;

    // Thông tin tạo/cập nhật
    String createdBy;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    // Thông tin pricing tổng hợp (từ variants)
    BigDecimal minPrice;

    BigDecimal maxPrice;

    Integer totalStock;

    List<CategoryResponse> storeCategories;
}