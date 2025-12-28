package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.response.AdminOrderStatisticsResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Service interface cho thống kê đơn hàng Admin Dashboard
 */
public interface AdminOrderStatisticsService {
    
    /**
     * Lấy thống kê tổng quan đơn hàng và doanh thu
     */
    AdminOrderStatisticsResponse getOrderStatistics(int topSellersLimit);
    
    /**
     * Lấy danh sách top sellers theo doanh thu
     */
    List<AdminOrderStatisticsResponse.TopSellerDTO> getTopSellers(int limit);
    
    /**
     * Lấy doanh thu theo khoảng thời gian
     */
    Map<String, BigDecimal> getRevenueByPeriod(String period, int months);
}
