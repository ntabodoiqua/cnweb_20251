package com.cnweb.inventory_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReserveInventoryRequest {
    
    @NotBlank(message = "PRODUCT_NOT_IN_INVENTORY")
    String productId;
    
    @NotBlank(message = "STORE_NOT_FOUND")
    String storeId;
    
    @NotNull(message = "INVALID_QUANTITY")
    @Min(value = 1, message = "INVALID_QUANTITY")
    Integer quantity;
    
    @NotBlank(message = "ORDER_ID_REQUIRED")
    String orderId; // Để track reservation
}
