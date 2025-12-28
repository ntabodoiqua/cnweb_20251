package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.response.AdminProductStatisticsResponse;
import com.vdt2025.product_service.dto.response.AdminProductStatisticsResponse.*;
import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.service.AdminProductStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp API thống kê sản phẩm cho Admin Dashboard
 */
@RestController
@RequestMapping("/admin/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Product Statistics", description = "APIs thống kê sản phẩm cho Admin Dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductStatisticsController {

    private final AdminProductStatisticsService statisticsService;

    /**
     * Lấy thống kê tổng quan sản phẩm
     */
    @GetMapping
    @Operation(summary = "Get product statistics", description = "Lấy thống kê tổng quan sản phẩm cho Admin Dashboard")
    public ResponseEntity<ApiResponse<AdminProductStatisticsResponse>> getProductStatistics(
            @RequestParam(defaultValue = "10") int topProductsLimit,
            @RequestParam(defaultValue = "10") int topStoresLimit) {
        log.info("Admin fetching product statistics with topProductsLimit={}, topStoresLimit={}", 
                topProductsLimit, topStoresLimit);
        
        AdminProductStatisticsResponse statistics = statisticsService.getProductStatistics(
                topProductsLimit, topStoresLimit);
        
        return ResponseEntity.ok(ApiResponse.<AdminProductStatisticsResponse>builder()
                .code(1000)
                .message("Product statistics retrieved successfully")
                .result(statistics)
                .build());
    }

    /**
     * Lấy Top sản phẩm bán chạy
     */
    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products", description = "Lấy danh sách sản phẩm bán chạy nhất")
    public ResponseEntity<ApiResponse<List<TopProductDTO>>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Admin fetching top {} selling products", limit);
        
        List<TopProductDTO> topProducts = statisticsService.getTopSellingProducts(limit);
        
        return ResponseEntity.ok(ApiResponse.<List<TopProductDTO>>builder()
                .code(1000)
                .message("Top selling products retrieved successfully")
                .result(topProducts)
                .build());
    }

    /**
     * Lấy thống kê theo Category
     */
    @GetMapping("/by-category")
    @Operation(summary = "Get statistics by category", description = "Lấy thống kê sản phẩm theo danh mục")
    public ResponseEntity<ApiResponse<List<CategoryStatsDTO>>> getStatsByCategory(
            @RequestParam(defaultValue = "false") boolean includeEmpty) {
        log.info("Admin fetching product stats by category, includeEmpty={}", includeEmpty);
        
        List<CategoryStatsDTO> stats = statisticsService.getProductsByCategory(includeEmpty);
        
        return ResponseEntity.ok(ApiResponse.<List<CategoryStatsDTO>>builder()
                .code(1000)
                .message("Category statistics retrieved successfully")
                .result(stats)
                .build());
    }

    /**
     * Lấy thống kê theo Brand
     */
    @GetMapping("/by-brand")
    @Operation(summary = "Get statistics by brand", description = "Lấy thống kê sản phẩm theo nhãn hàng")
    public ResponseEntity<ApiResponse<List<BrandStatsDTO>>> getStatsByBrand(
            @RequestParam(defaultValue = "false") boolean includeEmpty) {
        log.info("Admin fetching product stats by brand, includeEmpty={}", includeEmpty);
        
        List<BrandStatsDTO> stats = statisticsService.getProductsByBrand(includeEmpty);
        
        return ResponseEntity.ok(ApiResponse.<List<BrandStatsDTO>>builder()
                .code(1000)
                .message("Brand statistics retrieved successfully")
                .result(stats)
                .build());
    }

    /**
     * Lấy Top Stores theo số lượng sản phẩm
     */
    @GetMapping("/top-stores")
    @Operation(summary = "Get top stores by products", description = "Lấy danh sách cửa hàng có nhiều sản phẩm nhất")
    public ResponseEntity<ApiResponse<List<StoreStatsDTO>>> getTopStores(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Admin fetching top {} stores by products", limit);
        
        List<StoreStatsDTO> stores = statisticsService.getTopStoresByProducts(limit);
        
        return ResponseEntity.ok(ApiResponse.<List<StoreStatsDTO>>builder()
                .code(1000)
                .message("Top stores retrieved successfully")
                .result(stores)
                .build());
    }
}
