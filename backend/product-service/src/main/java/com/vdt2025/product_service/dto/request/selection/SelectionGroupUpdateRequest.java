package com.vdt2025.product_service.dto.request.selection;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request để cập nhật Selection Group
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SelectionGroupUpdateRequest {
    
    /**
     * Tên mới (optional)
     */
    @Size(max = 100, message = "SELECTION_GROUP_NAME_TOO_LONG")
    String name;
    
    /**
     * Mô tả mới (optional)
     */
    @Size(max = 255, message = "SELECTION_GROUP_DESCRIPTION_TOO_LONG")
    String description;
    
    /**
     * Thứ tự hiển thị mới (optional)
     */
    Integer displayOrder;
    
    /**
     * Bắt buộc chọn? (optional)
     */
    Boolean isRequired;
    
    /**
     * Cho phép chọn nhiều? (optional)
     */
    Boolean allowMultiple;
    
    /**
     * Có ảnh hưởng đến variant? (optional)
     */
    Boolean affectsVariant;
    
    /**
     * Trạng thái active (optional)
     */
    Boolean isActive;
}
