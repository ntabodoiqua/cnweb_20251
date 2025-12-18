package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Response DTO cho ảnh đánh giá
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingImageResponse {
    String id;
    String imageName;
    String imageUrl;
    Integer displayOrder;
}
