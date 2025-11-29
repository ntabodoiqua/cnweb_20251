package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO cho đánh giá sản phẩm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingResponse {
    String id;
    String userId;
    String productId;
    String productName;
    String variantId;
    String variantName;
    Integer rating;
    String comment;
    boolean isVerifiedPurchase;
    Integer helpfulCount;
    List<RatingImageResponse> images;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
