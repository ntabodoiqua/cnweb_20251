package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Response cho ảnh sản phẩm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductImageResponse {
    
    String id;
    
    String imageName;
    
    String imageUrl;
    
    Boolean isPrimary; // Ảnh chính
    
    Integer displayOrder; // Thứ tự hiển thị

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
