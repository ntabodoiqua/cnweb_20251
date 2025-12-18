package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoreFollowResponse {
    String id;
    String storeId;
    String storeName;
    String storeDescription;
    String logoUrl;
    String bannerUrl;
    Integer totalProducts;
    Integer totalSold;
    Double averageRating;
    Integer followerCount;
    LocalDateTime followedAt;
}
