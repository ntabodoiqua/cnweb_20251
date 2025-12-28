package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.response.AdminProductStatisticsResponse;
import com.vdt2025.product_service.dto.response.AdminProductStatisticsResponse.*;
import com.vdt2025.product_service.entity.Brand;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.repository.BrandRepository;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation cho thống kê sản phẩm Admin Dashboard
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminProductStatisticsServiceImpl implements AdminProductStatisticsService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Override
    @Cacheable(value = "admin-product-stats", key = "#topProductsLimit + '-' + #topStoresLimit", unless = "#result == null")
    public AdminProductStatisticsResponse getProductStatistics(int topProductsLimit, int topStoresLimit) {
        log.info("Computing product statistics for admin dashboard");
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();

        // Tổng quan sản phẩm
        long totalProducts = productRepository.countByIsDeletedFalse();
        long activeProducts = productRepository.countByIsActiveTrueAndIsDeletedFalse();
        long inactiveProducts = productRepository.countByIsActiveFalseAndIsDeletedFalse();
        long outOfStockProducts = productRepository.countOutOfStockProducts();
        long newProductsThisMonth = productRepository.countByCreatedAtAfterAndIsDeletedFalse(startOfMonth);

        // Tổng quan Store
        long totalStores = storeRepository.count();
        long activeStores = storeRepository.countByIsActiveTrue();

        // Tổng quan Category và Brand
        long totalCategories = categoryRepository.countByCategoryTypeAndIsActiveTrue(Category.CategoryType.PLATFORM);
        long totalBrands = brandRepository.countByIsActiveTrue();

        // Top sản phẩm bán chạy
        List<TopProductDTO> topSellingProducts = getTopSellingProducts(topProductsLimit);

        // Thống kê theo Category
        List<CategoryStatsDTO> productsByCategory = getProductsByCategory(false);

        // Thống kê theo Brand
        List<BrandStatsDTO> productsByBrand = getProductsByBrand(false);

        // Top Stores theo sản phẩm
        List<StoreStatsDTO> topStoresByProducts = getTopStoresByProducts(topStoresLimit);

        return AdminProductStatisticsResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .outOfStockProducts(outOfStockProducts)
                .newProductsThisMonth(newProductsThisMonth)
                .totalStores(totalStores)
                .activeStores(activeStores)
                .totalCategories(totalCategories)
                .totalBrands(totalBrands)
                .topSellingProducts(topSellingProducts)
                .productsByCategory(productsByCategory)
                .productsByBrand(productsByBrand)
                .topStoresByProducts(topStoresByProducts)
                .build();
    }

    @Override
    @Cacheable(value = "top-selling-products", key = "#limit", unless = "#result == null || #result.isEmpty()")
    public List<TopProductDTO> getTopSellingProducts(int limit) {
        log.info("Fetching top {} selling products", limit);
        
        List<Object[]> results = productRepository.findTopSellingProducts(
                PageRequest.of(0, limit));
        
        return results.stream()
                .map(this::mapToTopProductDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "products-by-category", key = "#includeEmpty", unless = "#result == null || #result.isEmpty()")
    public List<CategoryStatsDTO> getProductsByCategory(boolean includeEmpty) {
        log.info("Fetching product stats by category, includeEmpty={}", includeEmpty);
        
        List<Object[]> results = productRepository.getProductStatsByCategory();
        
        List<CategoryStatsDTO> stats = results.stream()
                .map(this::mapToCategoryStatsDTO)
                .collect(Collectors.toList());
        
        if (!includeEmpty) {
            stats = stats.stream()
                    .filter(s -> s.getProductCount() > 0)
                    .collect(Collectors.toList());
        }
        
        return stats;
    }

    @Override
    @Cacheable(value = "products-by-brand", key = "#includeEmpty", unless = "#result == null || #result.isEmpty()")
    public List<BrandStatsDTO> getProductsByBrand(boolean includeEmpty) {
        log.info("Fetching product stats by brand, includeEmpty={}", includeEmpty);
        
        List<Object[]> results = productRepository.getProductStatsByBrand();
        
        List<BrandStatsDTO> stats = results.stream()
                .map(this::mapToBrandStatsDTO)
                .collect(Collectors.toList());
        
        if (!includeEmpty) {
            stats = stats.stream()
                    .filter(s -> s.getProductCount() > 0)
                    .collect(Collectors.toList());
        }
        
        return stats;
    }

    @Override
    @Cacheable(value = "top-stores-by-products", key = "#limit", unless = "#result == null || #result.isEmpty()")
    public List<StoreStatsDTO> getTopStoresByProducts(int limit) {
        log.info("Fetching top {} stores by products", limit);
        
        List<Object[]> results = productRepository.getTopStoresByProducts(
                PageRequest.of(0, limit));
        
        return results.stream()
                .map(this::mapToStoreStatsDTO)
                .collect(Collectors.toList());
    }

    // ==================== Mapping methods ====================

    private TopProductDTO mapToTopProductDTO(Object[] row) {
        return TopProductDTO.builder()
                .productId((String) row[0])
                .productName((String) row[1])
                .storeName((String) row[2])
                .categoryName((String) row[3])
                .brandName((String) row[4])
                .imageUrl((String) row[5])
                .minPrice(row[6] != null ? new java.math.BigDecimal(row[6].toString()) : null)
                .maxPrice(row[7] != null ? new java.math.BigDecimal(row[7].toString()) : null)
                .soldCount(row[8] != null ? ((Number) row[8]).intValue() : 0)
                .viewCount(row[9] != null ? ((Number) row[9]).longValue() : 0L)
                .averageRating(row[10] != null ? ((Number) row[10]).doubleValue() : null)
                .ratingCount(row[11] != null ? ((Number) row[11]).intValue() : 0)
                .build();
    }

    private CategoryStatsDTO mapToCategoryStatsDTO(Object[] row) {
        return CategoryStatsDTO.builder()
                .categoryId((String) row[0])
                .categoryName((String) row[1])
                .parentCategoryName((String) row[2])
                .level(row[3] != null ? ((Number) row[3]).intValue() : 0)
                .productCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .totalSoldCount(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .totalViewCount(row[6] != null ? ((Number) row[6]).longValue() : 0L)
                .avgRating(row[7] != null ? ((Number) row[7]).doubleValue() : null)
                .build();
    }

    private BrandStatsDTO mapToBrandStatsDTO(Object[] row) {
        return BrandStatsDTO.builder()
                .brandId((String) row[0])
                .brandName((String) row[1])
                .logoUrl((String) row[2])
                .productCount(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .totalSoldCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .totalViewCount(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .avgRating(row[6] != null ? ((Number) row[6]).doubleValue() : null)
                .build();
    }

    private StoreStatsDTO mapToStoreStatsDTO(Object[] row) {
        return StoreStatsDTO.builder()
                .storeId((String) row[0])
                .storeName((String) row[1])
                .ownerUsername((String) row[2])
                .logoUrl((String) row[3])
                .productCount(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .totalSoldCount(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .followerCount(row[6] != null ? ((Number) row[6]).intValue() : 0)
                .avgRating(row[7] != null ? ((Number) row[7]).doubleValue() : null)
                .build();
    }
}
