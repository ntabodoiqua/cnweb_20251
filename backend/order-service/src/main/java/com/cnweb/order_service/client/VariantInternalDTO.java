package com.cnweb.order_service.client;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Lightweight Variant DTO for internal service communication
 * Mirrors com.vdt2025.product_service.dto.response.VariantInternalDTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantInternalDTO implements Serializable {
    
    String id;
    String sku;
    String variantName;
    String productId;
    String productName;
    String storeName;
    String storeId;
    String storeLogo;
    BigDecimal price;
    BigDecimal originalPrice;
    Integer stockQuantity;
    String imageUrl;
    boolean isActive;
    boolean isDeleted;
}
