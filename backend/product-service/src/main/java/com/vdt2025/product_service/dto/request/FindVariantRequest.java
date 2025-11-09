package com.vdt2025.product_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request để tìm variant dựa trên combination của attribute values
 * 
 * Example:
 * {
 *   "attributeValueIds": ["val-1", "val-3"]  // Màu Đỏ + Size M
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FindVariantRequest {
    
    /**
     * Danh sách ID của các attribute values đã chọn
     * Ví dụ: ["val-1", "val-3"] tương ứng với Màu Đỏ và Size M
     */
    @NotNull(message = "Attribute value IDs cannot be null")
    @NotEmpty(message = "Must select at least one attribute value")
    List<String> attributeValueIds;
}
