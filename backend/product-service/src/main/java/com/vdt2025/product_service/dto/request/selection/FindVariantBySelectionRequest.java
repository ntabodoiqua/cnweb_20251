package com.vdt2025.product_service.dto.request.selection;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request để tìm variant dựa trên selection options đã chọn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FindVariantBySelectionRequest {
    
    /**
     * Danh sách option IDs đã chọn
     * Mỗi group nên có 1 option được chọn
     */
    @NotEmpty(message = "SELECTION_OPTION_IDS_REQUIRED")
    List<String> optionIds;
}
