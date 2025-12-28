package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.response.AdminProductStatisticsResponse;
import com.vdt2025.product_service.dto.response.AdminProductStatisticsResponse.*;

import java.util.List;

/**
 * Service interface cho thống kê sản phẩm Admin Dashboard
 */
public interface AdminProductStatisticsService {
    
    /**
     * Lấy thống kê tổng quan sản phẩm
     */
    AdminProductStatisticsResponse getProductStatistics(int topProductsLimit, int topStoresLimit);
    
    /**
     * Lấy danh sách sản phẩm bán chạy nhất
     */
    List<TopProductDTO> getTopSellingProducts(int limit);
    
    /**
     * Lấy thống kê theo Category
     */
    List<CategoryStatsDTO> getProductsByCategory(boolean includeEmpty);
    
    /**
     * Lấy thống kê theo Brand
     */
    List<BrandStatsDTO> getProductsByBrand(boolean includeEmpty);
    
    /**
     * Lấy Top Stores theo số lượng sản phẩm
     */
    List<StoreStatsDTO> getTopStoresByProducts(int limit);
}
