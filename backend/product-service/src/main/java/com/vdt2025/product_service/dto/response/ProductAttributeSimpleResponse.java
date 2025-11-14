package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductAttributeSimpleResponse {
    String id;

    String name;

    String description;

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}