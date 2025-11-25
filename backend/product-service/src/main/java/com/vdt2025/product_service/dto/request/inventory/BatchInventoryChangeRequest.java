package com.vdt2025.product_service.dto.request.inventory;

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
    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    List<InventoryChangeRequest> items;
}
