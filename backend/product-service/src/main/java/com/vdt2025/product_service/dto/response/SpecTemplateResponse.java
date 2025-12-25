package com.vdt2025.product_service.dto.response;

import com.vdt2025.product_service.dto.SpecAttribute;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO cho spec template
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecTemplateResponse {
    
    String id;
    String name;
    String description;
    String categoryId;
    String categoryName;
    Map<String, SpecAttribute> specFields;
    Boolean isActive;
    Integer displayOrder;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
