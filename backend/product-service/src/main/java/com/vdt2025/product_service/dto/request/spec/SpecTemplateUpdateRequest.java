package com.vdt2025.product_service.dto.request.spec;

import com.vdt2025.product_service.dto.SpecAttribute;
import jakarta.validation.Valid;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO để cập nhật spec template
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecTemplateUpdateRequest {
    
    String name;
    String description;
    String categoryId;
    
    @Valid
    Map<String, SpecAttribute> specFields;
    
    Integer displayOrder;
    Boolean isActive;
}
