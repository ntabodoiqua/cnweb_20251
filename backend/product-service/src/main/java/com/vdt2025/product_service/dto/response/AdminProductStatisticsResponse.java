package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO chứa thông tin thống kê sản phẩm cho Admin Dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminProductStatisticsResponse {
    
    // ==================== Tổng quan sản phẩm ====================
    Long totalProducts;                  // Tổng số sản phẩm
    Long activeProducts;                 // Số sản phẩm đang active
    Long inactiveProducts;               // Số sản phẩm inactive
    Long outOfStockProducts;             // Số sản phẩm hết hàng
    Long newProductsThisMonth;           // Sản phẩm mới tháng này
    
    // ==================== Tổng quan Store ====================
    Long totalStores;                    // Tổng số cửa hàng
    Long activeStores;                   // Số cửa hàng đang hoạt động
    
    // ==================== Tổng quan Category ====================
    Long totalCategories;                // Tổng số danh mục platform
    Long totalBrands;                    // Tổng số nhãn hàng
    
    // ==================== Top sản phẩm bán chạy ====================
    List<TopProductDTO> topSellingProducts;
    
    // ==================== Thống kê theo Category ====================
    List<CategoryStatsDTO> productsByCategory;
    
    // ==================== Thống kê theo Brand ====================
    List<BrandStatsDTO> productsByBrand;
    
    // ==================== Thống kê theo Store ====================
    List<StoreStatsDTO> topStoresByProducts;

    /**
     * DTO thông tin Top sản phẩm bán chạy
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TopProductDTO {
        String productId;
        String productName;
        String storeName;
        String categoryName;
        String brandName;
        String imageUrl;
        BigDecimal minPrice;
        BigDecimal maxPrice;
        Integer soldCount;               // Số lượng đã bán
        Long viewCount;                  // Lượt xem
        Double averageRating;            // Đánh giá trung bình
        Integer ratingCount;             // Số đánh giá
    }

    /**
     * DTO thống kê theo Category
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CategoryStatsDTO {
        String categoryId;
        String categoryName;
        String parentCategoryName;       // Danh mục cha (nếu có)
        Integer level;                   // Cấp độ danh mục
        Long productCount;               // Số sản phẩm
        Long totalSoldCount;             // Tổng số đã bán
        Long totalViewCount;             // Tổng lượt xem
        Double avgRating;                // Rating trung bình
    }

    /**
     * DTO thống kê theo Brand
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class BrandStatsDTO {
        String brandId;
        String brandName;
        String logoUrl;
        Long productCount;               // Số sản phẩm
        Long totalSoldCount;             // Tổng số đã bán
        Long totalViewCount;             // Tổng lượt xem
        Double avgRating;                // Rating trung bình
    }

    /**
     * DTO thống kê theo Store
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class StoreStatsDTO {
        String storeId;
        String storeName;
        String ownerUsername;
        String logoUrl;
        Long productCount;               // Số sản phẩm
        Long totalSoldCount;             // Tổng số đã bán
        Integer followerCount;           // Số người theo dõi
        Double avgRating;                // Rating trung bình
    }
}
