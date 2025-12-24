package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO cho thống kê đánh giá sản phẩm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingSummaryResponse {
    String productId;
    Double averageRating;
    Long totalRatings;
    Map<Integer, Long> ratingDistribution; // Key: 1-5 sao, Value: số lượng
}
