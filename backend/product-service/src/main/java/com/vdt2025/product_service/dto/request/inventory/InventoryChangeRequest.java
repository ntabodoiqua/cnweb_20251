package com.vdt2025.product_service.dto.request.inventory;

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
    @NotBlank(message = "Variant ID không được để trống")
    String variantId;
    @NotNull(message = "Quantity không được để trống")
    @Min(value = 0, message = "Quantity phải >= 0")
    Integer quantity;
}
