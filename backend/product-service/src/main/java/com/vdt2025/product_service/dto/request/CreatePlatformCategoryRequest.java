package com.vdt2025.product_service.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO để Admin tạo danh mục toàn hệ thống (Platform Category)
 * Hỗ trợ tạo danh mục 2 cấp
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CreatePlatformCategoryRequest {

    @NotBlank(message = "CATEGORY_NAME_NOT_BLANK")
    String name;

    String description;

    /**
     * ID của danh mục cha (nếu tạo danh mục cấp 2)
     * Null nếu tạo danh mục cấp 1 (root)
     */
    String parentId;

    @Builder.Default
    boolean isActive = true;
}
