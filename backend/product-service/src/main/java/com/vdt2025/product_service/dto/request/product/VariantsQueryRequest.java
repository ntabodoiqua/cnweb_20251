package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantsQueryRequest {
    @NotEmpty(message = "Danh sách ID không được để trống") // 1. Kiểm tra List không null và size > 0
    List<@NotBlank(message = "ID sản phẩm không được để trống") String> variantIds;
}
