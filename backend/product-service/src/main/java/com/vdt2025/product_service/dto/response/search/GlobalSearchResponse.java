package com.vdt2025.product_service.dto.response.search;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Response cho tìm kiếm tổng hợp (cả sản phẩm và cửa hàng)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GlobalSearchResponse {

    // Kết quả sản phẩm
    ProductSearchResult products;
    
    // Kết quả cửa hàng
    StoreSearchResult stores;
    
    // Thời gian tìm kiếm tổng (ms)
    Long totalTook;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSearchResult {
        List<ProductSearchResponse.ProductSearchHit> hits;
        Long totalHits;
        Long took;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSearchResult {
        List<StoreSearchResponse.StoreSearchHit> hits;
        Long totalHits;
        Long took;
    }
}
