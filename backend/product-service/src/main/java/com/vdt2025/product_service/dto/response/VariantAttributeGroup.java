package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Represents một nhóm thuộc tính có thể chọn (Màu sắc, Kích thước, ...)
 * Mỗi group chứa danh sách các options có thể chọn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantAttributeGroup {
    
    /**
     * ID của ProductAttribute
     */
    String attributeId;
    
    /**
     * Tên thuộc tính (Màu sắc, Kích thước, Dung lượng, ...)
     */
    String attributeName;
    
    /**
     * Danh sách các giá trị có thể chọn
     */
    List<VariantAttributeOption> options;
}
