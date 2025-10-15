package com.vdt2025.product_service.dto.request.category;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryFilterRequest {
    String name;
    String createdBy;
}
