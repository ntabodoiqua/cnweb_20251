package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.RatingResponse;
import com.vdt2025.product_service.dto.response.RatingSummaryResponse;
import com.vdt2025.product_service.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

/**
 * Public Controller cho xem đánh giá sản phẩm (không cần authentication)
 * Dành cho khách hàng xem đánh giá của sản phẩm
 */
@RestController
@RequestMapping("/public/ratings")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Public Rating", description = "Public APIs for viewing product ratings")
public class PublicRatingController {

    RatingService ratingService;

    /**
     * Lấy tất cả đánh giá của một sản phẩm
     * GET /public/ratings/product/{productId}
     */
    @GetMapping("/product/{productId}")
    @Operation(summary = "Get product ratings", description = "Get all ratings for a product")
    public ApiResponse<Page<RatingResponse>> getProductRatings(
            @PathVariable String productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Public: Getting ratings for product {}", productId);

        Page<RatingResponse> response = ratingService.getProductRatings(productId, pageable);

        return ApiResponse.<Page<RatingResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy đánh giá theo số sao
     * GET /public/ratings/product/{productId}/stars/{starLevel}
     */
    @GetMapping("/product/{productId}/stars/{starLevel}")
    @Operation(summary = "Get ratings by star level", description = "Get ratings filtered by star level (1-5)")
    public ApiResponse<Page<RatingResponse>> getRatingsByStarLevel(
            @PathVariable String productId,
            @PathVariable Integer starLevel,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Public: Getting {} star ratings for product {}", starLevel, productId);

        Page<RatingResponse> response = ratingService.getProductRatingsByStarLevel(productId, starLevel, pageable);

        return ApiResponse.<Page<RatingResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy đánh giá có ảnh
     * GET /public/ratings/product/{productId}/with-images
     */
    @GetMapping("/product/{productId}/with-images")
    @Operation(summary = "Get ratings with images", description = "Get ratings that have images attached")
    public ApiResponse<Page<RatingResponse>> getRatingsWithImages(
            @PathVariable String productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Public: Getting ratings with images for product {}", productId);

        Page<RatingResponse> response = ratingService.getProductRatingsWithImages(productId, pageable);

        return ApiResponse.<Page<RatingResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy đánh giá verified purchase (đã mua hàng)
     * GET /public/ratings/product/{productId}/verified
     */
    @GetMapping("/product/{productId}/verified")
    @Operation(summary = "Get verified purchase ratings", description = "Get ratings from verified purchases only")
    public ApiResponse<Page<RatingResponse>> getVerifiedPurchaseRatings(
            @PathVariable String productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Public: Getting verified purchase ratings for product {}", productId);

        Page<RatingResponse> response = ratingService.getVerifiedPurchaseRatings(productId, pageable);

        return ApiResponse.<Page<RatingResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy thống kê đánh giá của sản phẩm
     * GET /public/ratings/product/{productId}/summary
     */
    @GetMapping("/product/{productId}/summary")
    @Operation(summary = "Get rating summary", description = "Get rating statistics for a product")
    public ApiResponse<RatingSummaryResponse> getRatingSummary(@PathVariable String productId) {
        log.info("Public: Getting rating summary for product {}", productId);

        RatingSummaryResponse response = ratingService.getRatingSummary(productId);

        return ApiResponse.<RatingSummaryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy các đánh giá mới nhất từ tất cả sản phẩm
     * GET /public/ratings/latest
     * Dùng cho trang chủ hiển thị testimonials
     */
    @GetMapping("/latest")
    @Operation(summary = "Get latest ratings", description = "Get latest ratings from all products for homepage testimonials")
    public ApiResponse<Page<RatingResponse>> getLatestRatings(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Public: Getting latest ratings for homepage");

        Page<RatingResponse> response = ratingService.getLatestRatings(pageable);

        return ApiResponse.<Page<RatingResponse>>builder()
                .result(response)
                .build();
    }
}
