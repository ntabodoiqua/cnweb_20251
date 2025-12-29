package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.response.SellerOrderStatisticsResponse;
import com.cnweb.order_service.repository.OrderRepository;
import com.cnweb.order_service.service.SellerOrderStatisticsService;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Controller cung cấp API thống kê đơn hàng cho Seller Dashboard
 */
@RestController
@RequestMapping("/api/v1/orders/seller/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Seller Order Statistics", description = "APIs thống kê đơn hàng cho Seller Dashboard")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public class SellerOrderStatisticsController {

    private final SellerOrderStatisticsService statisticsService;
    private final OrderRepository orderRepository;

    /**
     * Lấy thống kê tổng quan đơn hàng và doanh thu của seller
     */
    @GetMapping
    @Operation(summary = "Get seller order statistics", description = "Lấy thống kê tổng quan đơn hàng, doanh thu cho Seller Dashboard")
    public ResponseEntity<ApiResponse<SellerOrderStatisticsResponse>> getOrderStatistics(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String storeId,
            @RequestParam(defaultValue = "10") int topProductsLimit) {
        
        String username = jwt.getSubject();
        log.info("Seller {} fetching order statistics for store: {}", username, storeId);
        
        // Nếu không truyền storeId, lấy storeId từ đơn hàng của seller
        if (storeId == null || storeId.isEmpty()) {
            storeId = getStoreIdFromUsername(username);
            if (storeId == null) {
                return ResponseEntity.ok(ApiResponse.<SellerOrderStatisticsResponse>builder()
                        .code(1000)
                        .message("Không tìm thấy cửa hàng")
                        .result(SellerOrderStatisticsResponse.builder().build())
                        .build());
            }
        }
        
        SellerOrderStatisticsResponse statistics = statisticsService.getOrderStatistics(storeId, topProductsLimit);
        
        return ResponseEntity.ok(ApiResponse.<SellerOrderStatisticsResponse>builder()
                .code(1000)
                .message("Seller order statistics retrieved successfully")
                .result(statistics)
                .build());
    }

    /**
     * Lấy doanh thu theo khoảng thời gian của seller
     */
    @GetMapping("/revenue")
    @Operation(summary = "Get seller revenue by period", description = "Lấy doanh thu theo ngày/tháng trong khoảng thời gian")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getRevenueByPeriod(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String storeId,
            @RequestParam(defaultValue = "monthly") String period,  // daily, monthly
            @RequestParam(defaultValue = "12") int months) {
        
        String username = jwt.getSubject();
        log.info("Seller {} fetching revenue by period={}, months={}", username, period, months);
        
        // Nếu không truyền storeId, lấy storeId từ đơn hàng của seller
        if (storeId == null || storeId.isEmpty()) {
            storeId = getStoreIdFromUsername(username);
            if (storeId == null) {
                return ResponseEntity.ok(ApiResponse.<Map<String, BigDecimal>>builder()
                        .code(1000)
                        .message("Không tìm thấy cửa hàng")
                        .result(Map.of())
                        .build());
            }
        }
        
        var revenue = statisticsService.getRevenueByPeriod(storeId, period, months);
        
        return ResponseEntity.ok(ApiResponse.<Map<String, BigDecimal>>builder()
                .code(1000)
                .message("Revenue data retrieved successfully")
                .result(revenue)
                .build());
    }

    /**
     * Lấy storeId từ username của seller
     */
    private String getStoreIdFromUsername(String username) {
        var storeInfo = orderRepository.findStoreInfoByOwnerUsername(username, PageRequest.of(0, 1));
        if (!storeInfo.isEmpty()) {
            return (String) storeInfo.get(0)[0];
        }
        return null;
    }
}
