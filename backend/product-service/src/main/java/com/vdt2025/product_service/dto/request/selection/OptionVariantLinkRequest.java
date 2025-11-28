package com.vdt2025.product_service.dto.request.selection;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request để liên kết option với variant hoặc ngược lại
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OptionVariantLinkRequest {
    
    /**
     * Danh sách variant IDs để liên kết
     */
    @NotEmpty(message = "VARIANT_IDS_REQUIRED")
    List<String> variantIds;
}
