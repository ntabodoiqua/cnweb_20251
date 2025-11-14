package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Represents một giá trị có thể chọn cho một thuộc tính
 * Ví dụ: attribute "Màu sắc" có option "Đỏ", "Xanh", "Vàng"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantAttributeOption {
    
    /**
     * ID của attribute value này
     */
    String valueId;
    
    /**
     * Giá trị hiển thị (Đỏ, XL, 128GB, ...)
     */
    String value;
    
    /**
     * Có available không (có variant với thuộc tính này + các lựa chọn khác không)
     * Dùng để disable option khi không có variant tương ứng
     */
    boolean available;
}
