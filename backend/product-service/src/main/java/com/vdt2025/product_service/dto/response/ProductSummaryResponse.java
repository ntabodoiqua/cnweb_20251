package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response đơn giản cho danh sách sản phẩm (list/grid view)
 * Không bao gồm thông tin chi tiết để tối ưu performance
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSummaryResponse {
    
    String id;
    
    String name;
    
    String shortDescription;
    
    String thumbnailImage;
    
    BigDecimal minPrice;
    
    BigDecimal maxPrice;
    
    Integer soldCount;
    
    Double averageRating;
    
    Integer ratingCount;
    
    boolean isActive;
    
    String storeName;
    
    String storeId;
    
    String storeCategoryName;

    String platformCategoryName;
    
    String brandName;
    
    LocalDateTime createdAt;
}
