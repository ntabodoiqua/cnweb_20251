package com.vdt2025.product_service.dto.request.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request DTO để tạo đánh giá sản phẩm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateRatingRequest {

    @NotNull(message = "Product ID is required")
    String productId;

    String variantId; // Optional - nếu muốn đánh giá cụ thể variant

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    Integer rating;

    String comment; // Optional - nội dung đánh giá

    List<String> imageNames; // Optional - danh sách tên file ảnh đã upload
}
