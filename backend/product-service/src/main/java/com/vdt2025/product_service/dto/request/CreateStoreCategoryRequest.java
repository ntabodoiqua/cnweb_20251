package com.vdt2025.product_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để Seller tạo danh mục riêng cho Store
 * Chỉ hỗ trợ 1 cấp (không có parent)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStoreCategoryRequest {
    
    @NotBlank(message = "CATEGORY_NAME_NOT_BLANK")
    private String name;
    
    private String description;
    
    @Builder.Default
    private boolean isActive = true;
}
