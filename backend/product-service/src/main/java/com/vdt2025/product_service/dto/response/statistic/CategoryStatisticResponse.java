package com.vdt2025.product_service.dto.response.statistic;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryStatisticResponse {
    String categoryName;
    String imageUrl;
    long productCount;
    long productVariantCount;
    long productVariantActiveCount;
}
