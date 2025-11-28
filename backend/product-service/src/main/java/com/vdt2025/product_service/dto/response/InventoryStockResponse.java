package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryStockResponse {
    String id;
    String variantId;
    String variantSku;
    Integer quantityOnHand;
    Integer quantityReserved;
    Integer availableQuantity;
    boolean inStock;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
