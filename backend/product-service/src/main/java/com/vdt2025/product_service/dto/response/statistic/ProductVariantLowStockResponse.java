package com.vdt2025.product_service.dto.response.statistic;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductVariantLowStockResponse {
    String variantId;
    String variantName;
    String sku;
    String productId;
    String productName;
    Integer totalAvailableStock;
    String imageUrl;
}
