package com.cnweb.order_service.client;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantInfoDTO implements Serializable {

    String id;
    String sku;
    String variantName;
    String productId;
    String productName;
    BigDecimal price;
    BigDecimal originalPrice;
    Integer stockQuantity;
    String imageUrl;
    boolean isActive;
    boolean isDeleted;
}