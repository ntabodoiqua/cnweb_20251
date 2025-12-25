package com.cnweb.order_service.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request DTO for querying variants
 * Mirrors com.vdt2025.product_service.dto.request.product.VariantsQueryRequest
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantsQueryRequest {
    @NotEmpty
    List<@NotBlank(message = "PRODUCT_ID_REQUIRED") String> variantIds;
}