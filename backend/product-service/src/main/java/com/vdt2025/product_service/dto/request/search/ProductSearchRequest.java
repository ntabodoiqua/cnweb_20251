package com.vdt2025.product_service.dto.request.search;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request cho tìm kiếm sản phẩm với ElasticSearch
 * Hỗ trợ full-text search, filtering, và faceting
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSearchRequest {

    // Full-text search keyword
    String keyword;

    // Filters
    String categoryId;
    List<String> categoryIds;    // Multiple categories
    String storeId;
    List<String> storeIds;       // Multiple stores
    String brandId;
    List<String> brandIds;       // Multiple brands

    // Price range
    BigDecimal priceFrom;
    BigDecimal priceTo;

    // Rating filter
    Double minRating;

    // Status filters
    Boolean isActive;
    Boolean inStockOnly;

    // Attribute filters (e.g., Color: Red, Size: M)
    List<AttributeFilter> attributeFilters;

    // Sorting
    String sortBy;              // relevance, price, sold, rating, newest
    String sortDirection;       // asc, desc

    // Pagination (có thể sử dụng Pageable từ Spring thay thế)
    Integer page;
    Integer size;

    // Search options
    Boolean enableFuzzy;        // Cho phép tìm kiếm gần đúng
    Boolean enableSuggestion;   // Trả về gợi ý
    Boolean enableHighlight;    // Highlight kết quả
    Boolean enableAggregation;  // Trả về facets/aggregations

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttributeFilter {
        String attributeId;
        List<String> values;    // Có thể chọn nhiều values (OR)
    }
}
