package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartDTO implements Serializable {

    String cartId;
    String sessionId;
    String userName;
    @Builder.Default
    List<CartItemDTO> items = new ArrayList<>();
    Integer totalItems;
    BigDecimal totalPrice;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public void calculateTotals() {
        this.totalItems = items.stream()
                .mapToInt(CartItemDTO::getQuantity)
                .sum();

        this.totalPrice = items.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
