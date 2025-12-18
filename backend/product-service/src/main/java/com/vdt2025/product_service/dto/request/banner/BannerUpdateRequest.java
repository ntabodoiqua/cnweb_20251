package com.vdt2025.product_service.dto.request.banner;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BannerUpdateRequest {
    @Min(1)
    @Max(10)
    Integer displayOrder;

    String storeId;
}
