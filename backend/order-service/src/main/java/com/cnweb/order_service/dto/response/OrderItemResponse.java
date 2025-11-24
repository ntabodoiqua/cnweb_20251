package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * OrderItemResponse - DTO cho order item response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemResponse {

    String id;
    String productId;
    String productName;
    String variantId;
    String variantName;
    String sku;
    String productImage;
    BigDecimal price;
    Integer quantity;
    BigDecimal totalPrice;
}
