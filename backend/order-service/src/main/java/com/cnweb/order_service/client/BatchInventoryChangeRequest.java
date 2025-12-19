package com.cnweb.order_service.client;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class BatchInventoryChangeRequest {
    @NotEmpty(message = "PRODUCT_LIST_CANNOT_BE_EMPTY")
    List<InventoryChangeRequest> items;
}

