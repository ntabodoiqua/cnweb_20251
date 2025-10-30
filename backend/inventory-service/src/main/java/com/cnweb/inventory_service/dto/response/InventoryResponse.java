package com.cnweb.inventory_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryResponse {
    
    String id;
    String productId;
    String storeId;
    Integer availableQuantity;
    Integer reservedQuantity;
    Integer totalQuantity;
    Integer minStockLevel;
    Boolean needsRestock;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
