package com.cnweb.order_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddToCartRequest {

    @NotBlank(message = "PRODUCT_ID_REQUIRED")
    String productId;

    @NotBlank(message = "PRODUCT_NAME_REQUIRED")
    String productName;

    String variantId;

    String variantName;

    String imageUrl;

    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 1, message = "QUANTITY_MIN_1")
    Integer quantity;

    @NotNull(message = "PRICE_NOT_NULL")
    BigDecimal price;

    BigDecimal originalPrice;
}