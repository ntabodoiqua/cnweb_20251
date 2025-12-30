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
    
    // Deleted status filter (for admin only - to view deleted products)
    Boolean isDeleted;

    // Price range filter
    BigDecimal priceFrom;

    BigDecimal priceTo;

    // Stock filter
    Boolean inStockOnly; // Checkbox: "Chỉ hiện hàng còn"
    Integer minStock;    // Input: "Số lượng tối thiểu"

    // Helper để Service biết khi nào cần bypass cache
    public boolean hasStockFilter() {
        return (inStockOnly != null && inStockOnly) || minStock != null;
    }

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
