package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO chứa thông tin thống kê đơn hàng cho Admin Dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminOrderStatisticsResponse {
    
    // ==================== Tổng quan đơn hàng ====================
    Long totalOrders;                    // Tổng số đơn hàng
    Long todayOrders;                    // Đơn hàng hôm nay
    Long thisMonthOrders;                // Đơn hàng tháng này
    
    // Đơn hàng theo trạng thái
    Map<String, Long> ordersByStatus;
    
    // ==================== Doanh thu ====================
    BigDecimal totalRevenue;             // Tổng doanh thu (đơn DELIVERED)
    BigDecimal todayRevenue;             // Doanh thu hôm nay
    BigDecimal thisMonthRevenue;         // Doanh thu tháng này
    BigDecimal lastMonthRevenue;         // Doanh thu tháng trước
    BigDecimal avgOrderValue;            // Giá trị đơn hàng trung bình
    
    // Doanh thu theo tháng (12 tháng gần nhất)
    Map<String, BigDecimal> revenueByMonth;
    
    // Doanh thu theo ngày (30 ngày gần nhất)
    Map<String, BigDecimal> revenueByDay;
    
    // ==================== Top Sellers ====================
    List<TopSellerDTO> topSellers;       // Top sellers doanh thu cao nhất
    
    // ==================== Đơn hàng gần đây ====================
    List<RecentOrderDTO> recentOrders;   // 10 đơn hàng gần nhất
    
    // ==================== Tăng trưởng ====================
    Double orderGrowthPercent;           // % tăng trưởng đơn hàng so với tháng trước
    Double revenueGrowthPercent;         // % tăng trưởng doanh thu so với tháng trước

    /**
     * DTO thông tin Top Seller
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TopSellerDTO {
        String storeId;
        String storeName;
        String storeOwnerUsername;
        Long totalOrders;                // Tổng số đơn hàng
        BigDecimal totalRevenue;         // Tổng doanh thu
        Long deliveredOrders;            // Số đơn đã giao thành công
    }

    /**
     * DTO thông tin đơn hàng gần đây
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RecentOrderDTO {
        String orderId;
        String orderNumber;
        String customerUsername;
        String storeName;
        BigDecimal totalAmount;
        String status;
        String paymentStatus;
        String createdAt;
    }
}
