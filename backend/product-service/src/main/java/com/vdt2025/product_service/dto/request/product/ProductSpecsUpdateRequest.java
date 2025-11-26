package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO để cập nhật thông tin đặc tả kỹ thuật (specs) của Product
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSpecsUpdateRequest {
    
    @NotNull(message = "Specs cannot be null")
    Map<String, Object> specs;
}
