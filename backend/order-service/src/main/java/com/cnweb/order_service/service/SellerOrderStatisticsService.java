package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.response.SellerOrderStatisticsResponse;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Service interface cho thống kê đơn hàng Seller Dashboard
 */
public interface SellerOrderStatisticsService {
    
    /**
     * Lấy thống kê tổng quan đơn hàng và doanh thu của seller
     */
    SellerOrderStatisticsResponse getOrderStatistics(String storeId, int topProductsLimit);
    
    /**
     * Lấy doanh thu theo khoảng thời gian của seller
     */
    Map<String, BigDecimal> getRevenueByPeriod(String storeId, String period, int months);
}
