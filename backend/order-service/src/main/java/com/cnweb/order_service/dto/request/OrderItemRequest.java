package com.cnweb.order_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * OrderItemRequest - DTO cho item trong đơn hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemRequest {

    @NotBlank(message = "VARIANT_ID_REQUIRED")
    String variantId;

    @NotNull(message = "QUANTITY_NOT_NULL")
    @Min(value = 1, message = "QUANTITY_MIN_1")
    Integer quantity;
}
