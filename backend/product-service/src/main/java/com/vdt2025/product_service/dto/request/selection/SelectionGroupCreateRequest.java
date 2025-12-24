package com.vdt2025.product_service.dto.request.selection;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request để tạo mới Selection Group cho sản phẩm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SelectionGroupCreateRequest {
    
    /**
     * Tên nhóm lựa chọn
     * Ví dụ: "Mẫu điện thoại", "Kiểu vỏ", "Màu sắc"
     */
    @NotBlank(message = "SELECTION_GROUP_NAME_REQUIRED")
    @Size(max = 100, message = "SELECTION_GROUP_NAME_TOO_LONG")
    String name;
    
    /**
     * Mô tả ngắn (optional)
     */
    @Size(max = 255, message = "SELECTION_GROUP_DESCRIPTION_TOO_LONG")
    String description;
    
    /**
     * Thứ tự hiển thị (optional, default = 0)
     */
    Integer displayOrder;
    
    /**
     * Bắt buộc chọn? (default = true)
     */
    Boolean isRequired;
    
    /**
     * Cho phép chọn nhiều? (default = false)
     */
    Boolean allowMultiple;
    
    /**
     * Có ảnh hưởng đến variant selection? (default = true)
     */
    Boolean affectsVariant;
    
    /**
     * Danh sách options ban đầu (optional)
     */
    @Valid
    List<SelectionOptionCreateRequest> options;
}
