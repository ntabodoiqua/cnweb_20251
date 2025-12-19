package com.vdt2025.product_service.dto.request.search;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request cho tìm kiếm cửa hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoreSearchRequest {
    
    // Từ khóa tìm kiếm (tên cửa hàng, mô tả, địa chỉ)
    String keyword;
    
    // Lọc theo tỉnh/thành phố
    Integer provinceId;
    
    // Lọc theo phường/xã
    Integer wardId;
    
    // Lọc theo rating tối thiểu
    Double minRating;
    
    // Lọc theo số sản phẩm tối thiểu
    Integer minProducts;
    
    // Sắp xếp
    String sortBy;              // relevance, rating, products, sold, followers, newest
    String sortDirection;       // asc, desc
    
    // Các options
    @Builder.Default
    Boolean enableHighlight = true;
    
    @Builder.Default
    Boolean enableAggregation = false;
    
    @Builder.Default
    Boolean enableFuzzy = true;
}
