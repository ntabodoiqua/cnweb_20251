package com.vdt2025.product_service.dto.request.selection;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request để cập nhật Selection Option
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SelectionOptionUpdateRequest {
    
    /**
     * Giá trị mới (optional)
     */
    @Size(max = 100, message = "SELECTION_OPTION_VALUE_TOO_LONG")
    String value;
    
    /**
     * Nhãn mới (optional)
     */
    @Size(max = 100, message = "SELECTION_OPTION_LABEL_TOO_LONG")
    String label;
    
    /**
     * Mô tả mới (optional)
     */
    @Size(max = 500, message = "SELECTION_OPTION_DESCRIPTION_TOO_LONG")
    String description;
    
    /**
     * Thứ tự hiển thị mới (optional)
     */
    Integer displayOrder;
    
    /**
     * Mã màu mới (optional)
     */
    @Size(max = 10, message = "COLOR_CODE_TOO_LONG")
    String colorCode;
    
    /**
     * Có available không (optional)
     */
    Boolean isAvailable;
    
    /**
     * Trạng thái active (optional)
     */
    Boolean isActive;
}
