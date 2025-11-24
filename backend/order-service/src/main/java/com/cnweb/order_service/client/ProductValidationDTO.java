package com.cnweb.order_service.client;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductValidationDTO implements Serializable {
    
    String productId;
    String variantId;
    boolean isValid;
    boolean isActive;
    boolean inStock;
    Integer availableStock;
    BigDecimal currentPrice;
    String message;
}
