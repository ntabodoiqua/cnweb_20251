package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Lightweight Product DTO for internal service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductInternalDTO implements Serializable {
    
    String id;
    String name;
    String shortDescription;
    String imageUrl;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    boolean isActive;
    boolean isDeleted;
    Integer totalStock;
    String storeId;
    String storeName;
}
