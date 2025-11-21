package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemDTO implements Serializable {

    String productId;
    String productName;
    String variantId;
    String variantName;
    String imageUrl;
    Integer quantity;
    BigDecimal price;
    BigDecimal originalPrice;
    LocalDateTime addedAt;
    LocalDateTime updatedAt;

    public BigDecimal getSubtotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }
}
