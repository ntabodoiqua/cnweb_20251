package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO to track changes in cart items (price, stock, availability)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemChangeDTO implements Serializable {
    
    String variantId;
    String productName;
    String variantName;
    
    // Change types
    boolean priceChanged;
    boolean stockChanged;
    boolean unavailable;
    
    // Old and new values
    BigDecimal oldPrice;
    BigDecimal newPrice;
    Integer oldQuantity;
    Integer newQuantity; // Adjusted quantity due to stock
    Integer availableStock;
    
    String message;
}
