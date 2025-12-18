package com.vdt2025.product_service.dto.request.spec;

import com.vdt2025.product_service.dto.SpecAttribute;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO để tạo spec template
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecTemplateCreationRequest {
    
    @NotBlank(message = "Template name is required")
    String name;
    
    String description;
    
    @NotBlank(message = "Category ID is required")
    String categoryId;
    
    /**
     * Map các spec fields (không có value, chỉ có metadata)
     */
    @NotNull(message = "Spec fields cannot be null")
    @Valid
    Map<String, SpecAttribute> specFields;
    
    Integer displayOrder;
}
