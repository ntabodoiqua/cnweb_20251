package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO cho thông tin đặc tả kỹ thuật (specs) của Product
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSpecsResponse {
    
    String productId;
    Map<String, Object> specs;
}
