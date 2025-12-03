package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRatingRepository extends JpaRepository<ProductRating, String> {

    /**
     * Tìm rating theo userId và productId
     * Do có unique constraint nên chỉ có thể có 1 rating
     */
    Optional<ProductRating> findByUserIdAndProductId(String userId, String productId);

    /**
     * Kiểm tra user đã đánh giá sản phẩm này chưa
     */
    boolean existsByUserIdAndProductId(String userId, String productId);

    /**
     * Lấy tất cả đánh giá của một sản phẩm (chỉ active)
     */
    Page<ProductRating> findByProductIdAndIsActiveTrue(String productId, Pageable pageable);

    /**
     * Lấy tất cả đánh giá của một sản phẩm (cả inactive - cho admin)
     */
    Page<ProductRating> findByProductId(String productId, Pageable pageable);

    /**
     * Lấy tất cả đánh giá của user
     */
    Page<ProductRating> findByUserId(String userId, Pageable pageable);

    /**
     * Lấy đánh giá theo rating (số sao)
     */
    Page<ProductRating> findByProductIdAndRatingAndIsActiveTrue(String productId, Integer rating, Pageable pageable);

    /**
     * Đếm số đánh giá active của sản phẩm
     */
    long countByProductIdAndIsActiveTrue(String productId);

    /**
     * Tính điểm trung bình của sản phẩm
     */
    @Query("SELECT AVG(r.rating) FROM ProductRating r WHERE r.product.id = :productId AND r.isActive = true")
    Double calculateAverageRatingByProductId(@Param("productId") String productId);

    /**
     * Đếm số rating theo từng mức sao (1-5)
     */
    @Query("SELECT r.rating, COUNT(r) FROM ProductRating r WHERE r.product.id = :productId AND r.isActive = true GROUP BY r.rating ORDER BY r.rating")
    List<Object[]> countRatingsByStarLevel(@Param("productId") String productId);

    /**
     * Lấy đánh giá có ảnh
     */
    @Query("SELECT DISTINCT r FROM ProductRating r LEFT JOIN FETCH r.images WHERE r.product.id = :productId AND r.isActive = true AND SIZE(r.images) > 0")
    Page<ProductRating> findRatingsWithImagesByProductId(@Param("productId") String productId, Pageable pageable);

    /**
     * Lấy đánh giá verified purchase
     */
    Page<ProductRating> findByProductIdAndIsVerifiedPurchaseTrueAndIsActiveTrue(String productId, Pageable pageable);

    /**
     * Lấy tất cả đánh giá mới nhất (không theo product cụ thể)
     * Dùng cho trang chủ hiển thị reviews
     */
    Page<ProductRating> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}
