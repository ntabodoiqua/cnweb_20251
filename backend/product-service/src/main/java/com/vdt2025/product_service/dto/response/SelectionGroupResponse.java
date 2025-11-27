package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response cho Selection Group
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SelectionGroupResponse {
    
    String id;
    String name;
    String description;
    Integer displayOrder;
    boolean isRequired;
    boolean allowMultiple;
    boolean affectsVariant;
    boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    
    /**
     * Product ID mà group này thuộc về
     */
    String productId;
    
    /**
     * Danh sách options trong group
     */
    List<SelectionOptionResponse> options;
    
    /**
     * Tổng số options
     */
    Integer totalOptions;
}
