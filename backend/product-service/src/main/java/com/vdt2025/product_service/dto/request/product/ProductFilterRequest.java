package com.vdt2025.product_service.dto.request.product;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;

/**
 * Request để filter/search sản phẩm với nhiều tiêu chí
 * Best practice cho e-commerce
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFilterRequest {

    // Text search
    String keyword; // Tìm kiếm theo tên hoặc mô tả

    String name;

    // Filter by relationships
    String categoryId;

    String storeId;

    String brandId;
    String createdBy;

    // Status filter
    Boolean isActive;

    // Price range filter
    BigDecimal priceFrom;

    BigDecimal priceTo;

    // Stock filter
    Integer stockFrom;

    Integer stockTo;

    // Rating filter
    Double ratingFrom;

    Double ratingTo;

    // Date range filter
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    String createdFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    String createdTo;

    // Sort options (handled by Pageable, but can add custom sort)
    String sortBy; // name, price, soldCount, createdAt, averageRating

    String sortDirection; // asc, desc
}
