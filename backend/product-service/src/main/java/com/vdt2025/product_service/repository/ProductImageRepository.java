package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, String> {
    // Đếm số lượng ảnh của một sản phẩm
    Long countByProductId(String productId);

    // Lấy tất cả ảnh của một sản phẩm
    Boolean existsByProductIdAndDisplayOrder(String productId, Integer displayOrder);

    List<ProductImage> findAllByProductId(String productId);

    Optional<ProductImage> findFirstByProductIdOrderByDisplayOrderAsc(String productId);
}
