package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.rating.CreateRatingRequest;
import com.vdt2025.product_service.dto.request.rating.UpdateRatingRequest;
import com.vdt2025.product_service.dto.response.RatingResponse;
import com.vdt2025.product_service.dto.response.RatingSummaryResponse;
import com.vdt2025.product_service.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cho đánh giá sản phẩm (Rating)
 * Cho phép khách hàng đánh giá sản phẩm sau khi đã mua
 */
@RestController
@RequestMapping("/ratings")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Product Rating", description = "APIs for product rating management")
public class RatingController {

    RatingService ratingService;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())
                && authentication.getPrincipal() instanceof Jwt) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }

    // ==================== Customer Rating APIs ====================

    /**
     * Tạo đánh giá mới cho sản phẩm
     * POST /ratings
     * Yêu cầu: User phải đã mua sản phẩm và đơn hàng đã DELIVERED
     */
    @PostMapping
    @Operation(summary = "Create rating", description = "Create a new rating for a product. User must have purchased and received the product.")
    public ApiResponse<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest request) {
        String username = getCurrentUsername();
        log.info("User {} creating rating for product {}", username, request.getProductId());

        RatingResponse response = ratingService.createRating(username, request);

        return ApiResponse.<RatingResponse>builder()
                .code(201)
                .message("Rating created successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật đánh giá của user
     * PUT /ratings/{ratingId}
     */
    @PutMapping("/{ratingId}")
    @Operation(summary = "Update rating", description = "Update user's own rating")
    public ApiResponse<RatingResponse> updateRating(
            @PathVariable String ratingId,
            @Valid @RequestBody UpdateRatingRequest request) {
        String username = getCurrentUsername();
        log.info("User {} updating rating {}", username, ratingId);

        RatingResponse response = ratingService.updateRating(username, ratingId, request);

        return ApiResponse.<RatingResponse>builder()
                .message("Rating updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa đánh giá của user
     * DELETE /ratings/{ratingId}
     */
    @DeleteMapping("/{ratingId}")
    @Operation(summary = "Delete rating", description = "Delete user's own rating")
    public ApiResponse<Void> deleteRating(@PathVariable String ratingId) {
        String username = getCurrentUsername();
        log.info("User {} deleting rating {}", username, ratingId);

        ratingService.deleteRating(username, ratingId);

        return ApiResponse.<Void>builder()
                .message("Rating deleted successfully")
                .build();
    }

    /**
     * Lấy đánh giá của user cho một sản phẩm
     * GET /ratings/my-rating?productId=xxx
     */
    @GetMapping("/my-rating")
    @Operation(summary = "Get my rating for product", description = "Get current user's rating for a specific product")
    public ApiResponse<RatingResponse> getMyRatingForProduct(@RequestParam String productId) {
        String username = getCurrentUsername();
        log.info("Getting rating for product {} by user {}", productId, username);

        RatingResponse response = ratingService.getMyRatingForProduct(username, productId);

        return ApiResponse.<RatingResponse>builder()
                .message(response != null ? "Rating found" : "No rating found")
                .result(response)
                .build();
    }

    /**
     * Lấy tất cả đánh giá của user
     * GET /ratings/my-ratings
     */
    @GetMapping("/my-ratings")
    @Operation(summary = "Get my ratings", description = "Get all ratings by current user")
    public ApiResponse<Page<RatingResponse>> getMyRatings(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String username = getCurrentUsername();
        log.info("Getting all ratings by user {}", username);

        Page<RatingResponse> response = ratingService.getMyRatings(username, pageable);

        return ApiResponse.<Page<RatingResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Kiểm tra user có thể đánh giá sản phẩm không
     * GET /ratings/can-rate?productId=xxx
     */
    @GetMapping("/can-rate")
    @Operation(summary = "Check if can rate", description = "Check if current user can rate a product")
    public ApiResponse<Boolean> canRateProduct(@RequestParam String productId) {
        String username = getCurrentUsername();
        log.info("Checking if user {} can rate product {}", username, productId);

        boolean canRate = ratingService.canUserRateProduct(username, productId);

        return ApiResponse.<Boolean>builder()
                .result(canRate)
                .message(canRate ? "User can rate this product" : "User cannot rate this product")
                .build();
    }

    /**
     * Đánh dấu rating là helpful
     * POST /ratings/{ratingId}/helpful
     */
    @PostMapping("/{ratingId}/helpful")
    @Operation(summary = "Mark rating as helpful", description = "Mark a rating as helpful")
    public ApiResponse<Void> markAsHelpful(@PathVariable String ratingId) {
        log.info("Marking rating {} as helpful", ratingId);

        ratingService.markRatingAsHelpful(ratingId);

        return ApiResponse.<Void>builder()
                .message("Rating marked as helpful")
                .build();
    }
}
