package com.vdt2025.product_service.dto.request.selection;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Request để tạo mới Selection Option
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SelectionOptionCreateRequest {
    
    /**
     * Giá trị option
     * Ví dụ: "iPhone 15 Pro Max", "Đen Carbon"
     */
    @NotBlank(message = "SELECTION_OPTION_VALUE_REQUIRED")
    @Size(max = 100, message = "SELECTION_OPTION_VALUE_TOO_LONG")
    String value;
    
    /**
     * Nhãn hiển thị (optional)
     */
    @Size(max = 100, message = "SELECTION_OPTION_LABEL_TOO_LONG")
    String label;
    
    /**
     * Mô tả chi tiết (optional)
     */
    @Size(max = 500, message = "SELECTION_OPTION_DESCRIPTION_TOO_LONG")
    String description;
    
    /**
     * Thứ tự hiển thị (optional)
     */
    Integer displayOrder;
    
    /**
     * Điều chỉnh giá (optional)
     * Ví dụ: +50000 cho vỏ cao cấp
     */
    BigDecimal priceAdjustment;
    
    /**
     * Mã màu HEX nếu là màu sắc (optional)
     * Ví dụ: "#FF0000"
     */
    @Size(max = 10, message = "COLOR_CODE_TOO_LONG")
    String colorCode;
    
    /**
     * Số lượng tồn kho riêng (optional)
     */
    Integer stockQuantity;
}
