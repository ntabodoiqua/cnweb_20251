package com.vdt2025.product_service.dto.response.search;

import com.vdt2025.product_service.dto.response.ProductSummaryResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

/**
 * Response cho tìm kiếm sản phẩm với ElasticSearch
 * Bao gồm kết quả, aggregations (facets), và suggestions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSearchResponse {

    // Search results
    List<ProductSearchHit> hits;

    // Pagination info
    Long totalHits;
    Integer totalPages;
    Integer currentPage;
    Integer pageSize;

    // Search metadata
    Long took;                  // Thời gian tìm kiếm (ms)
    Float maxScore;             // Điểm cao nhất

    // Aggregations/Facets cho filtering UI
    SearchAggregations aggregations;

    // Suggestions cho autocomplete/did-you-mean
    List<String> suggestions;

    /**
     * Một kết quả tìm kiếm với highlight
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSearchHit {
        String id;
        Float score;
        ProductSummaryResponse product;
        Map<String, List<String>> highlights;   // Field -> highlighted fragments
    }

    /**
     * Aggregations cho faceted search
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchAggregations {
        List<BucketAggregation> categories;
        List<BucketAggregation> brands;
        List<BucketAggregation> stores;
        PriceRangeAggregation priceRange;
        RatingAggregation ratingDistribution;
        List<AttributeAggregation> attributes;
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
     * Price range aggregation
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRangeAggregation {
        Double min;
        Double max;
        Double avg;
        List<PriceRangeBucket> buckets;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class PriceRangeBucket {
            Double from;
            Double to;
            Long docCount;
        }
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
        Map<Integer, Long> distribution;    // Star -> count (1-5)
    }

    /**
     * Attribute aggregation cho dynamic filtering
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttributeAggregation {
        String attributeId;
        String attributeName;
        List<BucketAggregation> values;
    }
}
