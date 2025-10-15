package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    String id;
    String name;
    String description;
    String image_name;
    BigDecimal price;
    int quantity;
    CategoryResponse category;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    boolean active;
}
