package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.RatingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingImageRepository extends JpaRepository<RatingImage, String> {

    /**
     * Lấy tất cả ảnh của một rating
     */
    List<RatingImage> findByProductRatingId(String ratingId);

    /**
     * Xóa tất cả ảnh của một rating
     */
    void deleteByProductRatingId(String ratingId);
}
