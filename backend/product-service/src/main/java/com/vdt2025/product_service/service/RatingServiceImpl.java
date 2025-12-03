package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.client.OrderClient;
import com.vdt2025.product_service.client.UserClient;
import com.vdt2025.product_service.dto.request.rating.CreateRatingRequest;
import com.vdt2025.product_service.dto.request.rating.UpdateRatingRequest;
import com.vdt2025.product_service.dto.response.RatingImageResponse;
import com.vdt2025.product_service.dto.response.RatingResponse;
import com.vdt2025.product_service.dto.response.RatingSummaryResponse;
import com.vdt2025.product_service.dto.response.UserInfoResponse;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.entity.ProductRating;
import com.vdt2025.product_service.entity.ProductVariant;
import com.vdt2025.product_service.entity.RatingImage;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.ProductRatingRepository;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.repository.ProductVariantRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RatingServiceImpl implements RatingService {

    ProductRatingRepository ratingRepository;
    ProductRepository productRepository;
    ProductVariantRepository variantRepository;
    OrderClient orderClient;
    UserClient userClient;

    private static final int MAX_IMAGES_PER_RATING = 5;

    @Override
    @Transactional
    public RatingResponse createRating(String username, CreateRatingRequest request) {
        log.info("Creating rating for product {} by user {}", request.getProductId(), username);

        // 1. Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // 2. Kiểm tra user đã đánh giá sản phẩm này chưa
        if (ratingRepository.existsByUserIdAndProductId(username, request.getProductId())) {
            throw new AppException(ErrorCode.RATING_ALREADY_EXISTS);
        }

        // 3. Verify user đã mua sản phẩm (order đã DELIVERED)
        boolean hasPurchased = verifyPurchase(username, request.getProductId());
        if (!hasPurchased) {
            throw new AppException(ErrorCode.PURCHASE_NOT_VERIFIED);
        }

        // 4. Lấy orderId (optional)
        String orderId = getDeliveredOrderId(username, request.getProductId());

        // 5. Validate variant nếu có
        ProductVariant variant = null;
        if (request.getVariantId() != null && !request.getVariantId().isEmpty()) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new AppException(ErrorCode.VARIANT_NOT_BELONG_TO_PRODUCT);
            }
        }

        // 6. Validate số lượng ảnh
        if (request.getImageNames() != null && request.getImageNames().size() > MAX_IMAGES_PER_RATING) {
            throw new AppException(ErrorCode.RATING_IMAGE_LIMIT_EXCEEDED);
        }

        // 7. Tạo rating entity
        ProductRating rating = ProductRating.builder()
                .userId(username)
                .product(product)
                .variant(variant)
                .orderId(orderId)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerifiedPurchase(true)
                .isActive(true)
                .build();

        // 8. Thêm ảnh nếu có
        if (request.getImageNames() != null && !request.getImageNames().isEmpty()) {
            int order = 0;
            for (String imageName : request.getImageNames()) {
                RatingImage image = RatingImage.builder()
                        .imageName(imageName)
                        .displayOrder(order++)
                        .build();
                rating.addImage(image);
            }
        }

        // 9. Lưu rating
        rating = ratingRepository.save(rating);

        // 10. Cập nhật thống kê rating cho product
        updateProductRatingStats(product.getId());

        return toRatingResponse(rating);
    }

    @Override
    @Transactional
    public RatingResponse updateRating(String username, String ratingId, UpdateRatingRequest request) {
        log.info("Updating rating {} by user {}", ratingId, username);

        // 1. Tìm rating
        ProductRating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new AppException(ErrorCode.RATING_NOT_FOUND));

        // 2. Kiểm tra quyền sở hữu
        if (!rating.getUserId().equals(username)) {
            throw new AppException(ErrorCode.RATING_UNAUTHORIZED);
        }

        // 3. Cập nhật rating nếu có
        if (request.getRating() != null) {
            rating.setRating(request.getRating());
        }

        // 4. Cập nhật comment nếu có
        if (request.getComment() != null) {
            rating.setComment(request.getComment());
        }

        // 5. Cập nhật ảnh nếu có (thay thế hoàn toàn)
        if (request.getImageNames() != null) {
            if (request.getImageNames().size() > MAX_IMAGES_PER_RATING) {
                throw new AppException(ErrorCode.RATING_IMAGE_LIMIT_EXCEEDED);
            }

            // Xóa ảnh cũ
            rating.clearImages();

            // Thêm ảnh mới
            int order = 0;
            for (String imageName : request.getImageNames()) {
                RatingImage image = RatingImage.builder()
                        .imageName(imageName)
                        .displayOrder(order++)
                        .build();
                rating.addImage(image);
            }
        }

        // 6. Lưu rating
        rating = ratingRepository.save(rating);

        // 7. Cập nhật thống kê rating cho product
        updateProductRatingStats(rating.getProduct().getId());

        return toRatingResponse(rating);
    }

    @Override
    @Transactional
    public void deleteRating(String username, String ratingId) {
        log.info("Deleting rating {} by user {}", ratingId, username);

        // 1. Tìm rating
        ProductRating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new AppException(ErrorCode.RATING_NOT_FOUND));

        // 2. Kiểm tra quyền sở hữu
        if (!rating.getUserId().equals(username)) {
            throw new AppException(ErrorCode.RATING_UNAUTHORIZED);
        }

        String productId = rating.getProduct().getId();

        // 3. Xóa rating
        ratingRepository.delete(rating);

        // 4. Cập nhật thống kê rating cho product
        updateProductRatingStats(productId);
    }

    @Override
    public RatingResponse getMyRatingForProduct(String username, String productId) {
        log.info("Getting rating for product {} by user {}", productId, username);

        return ratingRepository.findByUserIdAndProductId(username, productId)
                .map(this::toRatingResponse)
                .orElse(null);
    }

    @Override
    public Page<RatingResponse> getMyRatings(String username, Pageable pageable) {
        log.info("Getting all ratings by user {}", username);
        return ratingRepository.findByUserId(username, pageable)
                .map(this::toRatingResponse);
    }

    @Override
    public Page<RatingResponse> getProductRatings(String productId, Pageable pageable) {
        log.info("Getting ratings for product {}", productId);
        return ratingRepository.findByProductIdAndIsActiveTrue(productId, pageable)
                .map(this::toRatingResponse);
    }

    @Override
    public Page<RatingResponse> getProductRatingsByStarLevel(String productId, Integer starLevel, Pageable pageable) {
        log.info("Getting ratings for product {} with {} stars", productId, starLevel);
        return ratingRepository.findByProductIdAndRatingAndIsActiveTrue(productId, starLevel, pageable)
                .map(this::toRatingResponse);
    }

    @Override
    public Page<RatingResponse> getProductRatingsWithImages(String productId, Pageable pageable) {
        log.info("Getting ratings with images for product {}", productId);
        return ratingRepository.findRatingsWithImagesByProductId(productId, pageable)
                .map(this::toRatingResponse);
    }

    @Override
    public Page<RatingResponse> getVerifiedPurchaseRatings(String productId, Pageable pageable) {
        log.info("Getting verified purchase ratings for product {}", productId);
        return ratingRepository.findByProductIdAndIsVerifiedPurchaseTrueAndIsActiveTrue(productId, pageable)
                .map(this::toRatingResponse);
    }

    @Override
    public RatingSummaryResponse getRatingSummary(String productId) {
        log.info("Getting rating summary for product {}", productId);

        // Kiểm tra product tồn tại
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        Double averageRating = ratingRepository.calculateAverageRatingByProductId(productId);
        long totalRatings = ratingRepository.countByProductIdAndIsActiveTrue(productId);
        List<Object[]> ratingCounts = ratingRepository.countRatingsByStarLevel(productId);

        // Convert to Map
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        for (Object[] row : ratingCounts) {
            Integer star = (Integer) row[0];
            Long count = (Long) row[1];
            distribution.put(star, count);
        }

        return RatingSummaryResponse.builder()
                .productId(productId)
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalRatings(totalRatings)
                .ratingDistribution(distribution)
                .build();
    }

    @Override
    public boolean canUserRateProduct(String username, String productId) {
        // Kiểm tra user đã đánh giá chưa
        if (ratingRepository.existsByUserIdAndProductId(username, productId)) {
            return false;
        }
        // Kiểm tra user đã mua sản phẩm chưa
        return verifyPurchase(username, productId);
    }

    @Override
    @Transactional
    public void markRatingAsHelpful(String ratingId) {
        ProductRating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new AppException(ErrorCode.RATING_NOT_FOUND));

        rating.setHelpfulCount(rating.getHelpfulCount() + 1);
        ratingRepository.save(rating);
    }

    @Override
    public Page<RatingResponse> getLatestRatings(Pageable pageable) {
        log.info("Getting latest ratings for homepage");
        Page<ProductRating> ratingsPage = ratingRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        
        // Get all usernames from ratings
        List<String> usernames = ratingsPage.getContent().stream()
                .map(ProductRating::getUserId)
                .distinct()
                .collect(Collectors.toList());
        
        // Fetch user info in batch
        Map<String, UserInfoResponse> userInfoMap = fetchUserInfoBatch(usernames);
        
        // Convert ratings with user info
        List<RatingResponse> responses = ratingsPage.getContent().stream()
                .map(rating -> toRatingResponseWithUserInfo(rating, userInfoMap.get(rating.getUserId())))
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, ratingsPage.getTotalElements());
    }

    // ============== Private Helper Methods ==============

    private Map<String, UserInfoResponse> fetchUserInfoBatch(List<String> usernames) {
        if (usernames == null || usernames.isEmpty()) {
            return Collections.emptyMap();
        }
        
        try {
            ApiResponse<Map<String, UserInfoResponse>> response = userClient.getUsersByUsernames(usernames);
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (Exception e) {
            log.warn("Error fetching user info batch: {}", e.getMessage());
        }
        
        return Collections.emptyMap();
    }

    private boolean verifyPurchase(String username, String productId) {
        try {
            ApiResponse<Boolean> response = orderClient.verifyPurchase(username, productId);
            return response.getResult() != null && response.getResult();
        } catch (Exception e) {
            log.error("Error verifying purchase for user {} and product {}: {}", 
                    username, productId, e.getMessage());
            throw new AppException(ErrorCode.ORDER_SERVICE_ERROR);
        }
    }

    private String getDeliveredOrderId(String username, String productId) {
        try {
            ApiResponse<String> response = orderClient.getDeliveredOrderId(username, productId);
            return response.getResult();
        } catch (Exception e) {
            log.warn("Error getting order ID for user {} and product {}: {}", 
                    username, productId, e.getMessage());
            return null;
        }
    }

    private void updateProductRatingStats(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Double averageRating = ratingRepository.calculateAverageRatingByProductId(productId);
        long ratingCount = ratingRepository.countByProductIdAndIsActiveTrue(productId);

        product.setAverageRating(averageRating);
        product.setRatingCount((int) ratingCount);
        productRepository.save(product);

        log.info("Updated product {} stats: averageRating={}, ratingCount={}", 
                productId, averageRating, ratingCount);
    }

    private RatingResponse toRatingResponse(ProductRating rating) {
        List<RatingImageResponse> imageResponses = rating.getImages().stream()
                .map(img -> RatingImageResponse.builder()
                        .id(img.getId())
                        .imageName(img.getImageName())
                        .imageUrl(img.getImageUrl())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .sorted(Comparator.comparing(RatingImageResponse::getDisplayOrder))
                .collect(Collectors.toList());

        return RatingResponse.builder()
                .id(rating.getId())
                .userId(rating.getUserId())
                .username(rating.getUserId())
                .userFullName(null)
                .userAvatarUrl(null)
                .productId(rating.getProduct().getId())
                .productName(rating.getProduct().getName())
                .variantId(rating.getVariant() != null ? rating.getVariant().getId() : null)
                .variantName(rating.getVariant() != null ? rating.getVariant().getVariantName() : null)
                .rating(rating.getRating())
                .comment(rating.getComment())
                .isVerifiedPurchase(rating.isVerifiedPurchase())
                .helpfulCount(rating.getHelpfulCount())
                .images(imageResponses)
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .build();
    }

    private RatingResponse toRatingResponseWithUserInfo(ProductRating rating, UserInfoResponse userInfo) {
        List<RatingImageResponse> imageResponses = rating.getImages().stream()
                .map(img -> RatingImageResponse.builder()
                        .id(img.getId())
                        .imageName(img.getImageName())
                        .imageUrl(img.getImageUrl())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .sorted(Comparator.comparing(RatingImageResponse::getDisplayOrder))
                .collect(Collectors.toList());

        String fullName = null;
        String avatarUrl = null;
        
        if (userInfo != null) {
            fullName = userInfo.getFullName();
            avatarUrl = userInfo.getAvatarUrl();
        }

        return RatingResponse.builder()
                .id(rating.getId())
                .userId(rating.getUserId())
                .username(rating.getUserId())
                .userFullName(fullName)
                .userAvatarUrl(avatarUrl)
                .productId(rating.getProduct().getId())
                .productName(rating.getProduct().getName())
                .variantId(rating.getVariant() != null ? rating.getVariant().getId() : null)
                .variantName(rating.getVariant() != null ? rating.getVariant().getVariantName() : null)
                .rating(rating.getRating())
                .comment(rating.getComment())
                .isVerifiedPurchase(rating.isVerifiedPurchase())
                .helpfulCount(rating.getHelpfulCount())
                .images(imageResponses)
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .build();
    }
}
