package com.vdt2025.product_service.dto.response.search;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Response cho tìm kiếm cửa hàng với ElasticSearch
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoreSearchResponse {

    // Search results
    List<StoreSearchHit> hits;

    // Pagination info
    Long totalHits;
    Integer totalPages;
    Integer currentPage;
    Integer pageSize;

    // Search metadata
    Long took;                  // Thời gian tìm kiếm (ms)
    Float maxScore;             // Điểm cao nhất

    // Aggregations/Facets cho filtering UI
    StoreSearchAggregations aggregations;

    /**
     * Một kết quả tìm kiếm store với highlight
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSearchHit {
        String id;
        Float score;
        StoreSummaryResponse store;
        Map<String, List<String>> highlights;   // Field -> highlighted fragments
    }

    /**
     * Summary response cho store trong search results
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSummaryResponse {
        String id;
        String sellerProfileId;
        String userName;
        String storeName;
        String storeDescription;
        String logoUrl;
        String bannerUrl;
        String shopAddress;
        Integer provinceId;
        Integer wardId;
        Boolean isActive;
        Integer totalProducts;
        Integer totalSold;
        Double averageRating;
        Integer followerCount;
        LocalDateTime createdAt;
    }

    /**
     * Aggregations cho faceted search
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSearchAggregations {
        List<BucketAggregation> provinces;
        RatingAggregation ratingDistribution;
    }

    /**
     * Bucket aggregation (count per term)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BucketAggregation {
        String key;             // ID hoặc value
        String label;           // Display name
        Long docCount;
    }

    /**
     * Rating distribution
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingAggregation {
        Double average;
        Long totalRatings;
    }
}
