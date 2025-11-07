package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request để tạo variant cho sản phẩm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantCreationRequest {
    
    @NotBlank(message = "SKU_REQUIRED")
    String sku;
    
    String variantName; // Ví dụ: "Trắng - Size L"
    
    @NotNull(message = "PRICE_REQUIRED")
    @Min(value = 0, message = "PRICE_MUST_BE_POSITIVE")
    BigDecimal price;
    
    BigDecimal originalPrice;
    
    @NotNull(message = "STOCK_QUANTITY_REQUIRED")
    @Min(value = 0, message = "STOCK_QUANTITY_MUST_BE_POSITIVE")
    Integer stockQuantity;
    
    String imageName;

    // Danh sách ID của attribute values
    // Ví dụ: ["attr_value_1", "attr_value_2"] cho "Màu Trắng" và "Size L"
    List<String> attributeValueIds;
}
