package com.cnweb.order_service.client;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class InventoryChangeRequest {
    @NotBlank(message = "VARIANT_ID_REQUIRED")
    String variantId;
    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 0, message = "QUANTITY_MIN_1")
    Integer quantity;
}