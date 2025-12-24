package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request để cập nhật trạng thái nhiều biến thể của 1 sản phẩm cùng lúc
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BulkVariantStatusUpdateRequest {

    @NotEmpty(message = "VARIANT_IDS_REQUIRED")
    List<String> variantIds;

    @NotNull(message = "STATUS_REQUIRED")
    Boolean isActive;
}
