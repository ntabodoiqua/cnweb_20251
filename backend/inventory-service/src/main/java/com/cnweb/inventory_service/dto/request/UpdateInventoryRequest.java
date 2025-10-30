package com.cnweb.inventory_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateInventoryRequest {
    
    @NotNull(message = "INVALID_QUANTITY")
    @Min(value = 0, message = "INVALID_QUANTITY")
    Integer quantityChange; // Số lượng thay đổi (có thể âm hoặc dương)
    
    @Min(value = 0, message = "INVALID_QUANTITY")
    Integer minStockLevel;
}
