package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Request để cập nhật variant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantUpdateRequest {
    
    String variantName;
    
    @Min(value = 0, message = "PRICE_MUST_BE_POSITIVE")
    BigDecimal price;
    
    BigDecimal originalPrice;
    
    @Min(value = 0, message = "STOCK_QUANTITY_MUST_BE_POSITIVE")
    Integer stockQuantity;
    
    String imageName;
    
    Boolean isActive;
}
