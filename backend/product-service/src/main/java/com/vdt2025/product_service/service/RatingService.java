package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.rating.CreateRatingRequest;
import com.vdt2025.product_service.dto.request.rating.UpdateRatingRequest;
import com.vdt2025.product_service.dto.response.RatingResponse;
import com.vdt2025.product_service.dto.response.RatingSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface cho đánh giá sản phẩm
 */
public interface RatingService {

    /**
     * Tạo đánh giá mới cho sản phẩm
     * Yêu cầu: User phải đã mua sản phẩm (order đã DELIVERED)
     * Mỗi user chỉ được đánh giá 1 lần cho 1 sản phẩm
     */
    RatingResponse createRating(String username, CreateRatingRequest request);

    /**
     * Cập nhật đánh giá của user
     */
    RatingResponse updateRating(String username, String ratingId, UpdateRatingRequest request);

    /**
     * Xóa đánh giá của user
     */
    void deleteRating(String username, String ratingId);

    /**
     * Lấy đánh giá của user cho một sản phẩm (nếu có)
     */
    RatingResponse getMyRatingForProduct(String username, String productId);

    /**
     * Lấy tất cả đánh giá của user
     */
    Page<RatingResponse> getMyRatings(String username, Pageable pageable);

    /**
     * Lấy tất cả đánh giá của một sản phẩm
     */
    Page<RatingResponse> getProductRatings(String productId, Pageable pageable);

    /**
     * Lấy đánh giá theo số sao
     */
    Page<RatingResponse> getProductRatingsByStarLevel(String productId, Integer starLevel, Pageable pageable);

    /**
     * Lấy đánh giá có ảnh
     */
    Page<RatingResponse> getProductRatingsWithImages(String productId, Pageable pageable);

    /**
     * Lấy đánh giá verified purchase
     */
    Page<RatingResponse> getVerifiedPurchaseRatings(String productId, Pageable pageable);

    /**
     * Lấy thống kê đánh giá của sản phẩm
     */
    RatingSummaryResponse getRatingSummary(String productId);

    /**
     * Kiểm tra user có thể đánh giá sản phẩm không
     */
    boolean canUserRateProduct(String username, String productId);

    /**
     * Đánh dấu đánh giá là helpful
     */
    void markRatingAsHelpful(String ratingId);
}
