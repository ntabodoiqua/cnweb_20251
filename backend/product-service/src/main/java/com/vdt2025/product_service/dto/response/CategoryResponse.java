package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    String id;
    String name;
    String description;
    String imageName;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
