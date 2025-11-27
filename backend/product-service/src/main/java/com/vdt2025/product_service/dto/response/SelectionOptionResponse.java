package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response cho Selection Option
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SelectionOptionResponse {
    
    String id;
    String value;
    String label;
    String description;
    Integer displayOrder;
    String imageName;
    String imageUrl;
    BigDecimal priceAdjustment;
    String colorCode;
    Integer stockQuantity;
    boolean isAvailable;
    boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    
    /**
     * Danh sách variant IDs được liên kết
     */
    List<String> linkedVariantIds;
    
    /**
     * Số lượng variants được liên kết
     */
    Integer linkedVariantCount;
}
