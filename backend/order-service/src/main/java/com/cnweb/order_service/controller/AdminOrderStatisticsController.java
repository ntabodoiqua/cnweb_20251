package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.response.AdminOrderStatisticsResponse;
import com.cnweb.order_service.service.AdminOrderStatisticsService;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cung cấp API thống kê đơn hàng cho Admin Dashboard
 */
@RestController
@RequestMapping("/api/v1/orders/admin/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Order Statistics", description = "APIs thống kê đơn hàng cho Admin Dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderStatisticsController {

    private final AdminOrderStatisticsService statisticsService;

    /**
     * Lấy thống kê tổng quan đơn hàng và doanh thu
     */
    @GetMapping
    @Operation(summary = "Get order statistics", description = "Lấy thống kê tổng quan đơn hàng, doanh thu cho Admin Dashboard")
    public ResponseEntity<ApiResponse<AdminOrderStatisticsResponse>> getOrderStatistics(
            @RequestParam(defaultValue = "10") int topSellersLimit) {
        log.info("Admin fetching order statistics with topSellersLimit={}", topSellersLimit);
        
        AdminOrderStatisticsResponse statistics = statisticsService.getOrderStatistics(topSellersLimit);
        
        return ResponseEntity.ok(ApiResponse.<AdminOrderStatisticsResponse>builder()
                .code(1000)
                .message("Order statistics retrieved successfully")
                .result(statistics)
                .build());
    }

    /**
     * Lấy Top Sellers theo doanh thu
     */
    @GetMapping("/top-sellers")
    @Operation(summary = "Get top sellers", description = "Lấy danh sách top sellers có doanh thu cao nhất")
    public ResponseEntity<ApiResponse<java.util.List<AdminOrderStatisticsResponse.TopSellerDTO>>> getTopSellers(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Admin fetching top {} sellers", limit);
        
        var topSellers = statisticsService.getTopSellers(limit);
        
        return ResponseEntity.ok(ApiResponse.<java.util.List<AdminOrderStatisticsResponse.TopSellerDTO>>builder()
                .code(1000)
                .message("Top sellers retrieved successfully")
                .result(topSellers)
                .build());
    }

    /**
     * Lấy doanh thu theo khoảng thời gian
     */
    @GetMapping("/revenue")
    @Operation(summary = "Get revenue by period", description = "Lấy doanh thu theo ngày/tháng trong khoảng thời gian")
    public ResponseEntity<ApiResponse<java.util.Map<String, java.math.BigDecimal>>> getRevenueByPeriod(
            @RequestParam(defaultValue = "monthly") String period,  // daily, monthly
            @RequestParam(defaultValue = "12") int months) {
        log.info("Admin fetching revenue by period={}, months={}", period, months);
        
        var revenue = statisticsService.getRevenueByPeriod(period, months);
        
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, java.math.BigDecimal>>builder()
                .code(1000)
                .message("Revenue data retrieved successfully")
                .result(revenue)
                .build());
    }
}
