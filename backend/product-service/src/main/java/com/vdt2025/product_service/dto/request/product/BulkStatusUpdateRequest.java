package com.vdt2025.product_service.dto.request.product;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request để cập nhật trạng thái nhiều sản phẩm cùng lúc
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BulkStatusUpdateRequest {
    
    @NotEmpty(message = "PRODUCT_IDS_REQUIRED")
    List<String> productIds;
    
    @NotNull(message = "STATUS_REQUIRED")
    Boolean isActive;
}
