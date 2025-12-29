package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO chứa thông tin thống kê đơn hàng cho Seller Dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerOrderStatisticsResponse {
    
    // ==================== Thông tin cửa hàng ====================
    String storeId;
    String storeName;
    
    // ==================== Tổng quan đơn hàng ====================
    Long totalOrders;                    // Tổng số đơn hàng
    Long todayOrders;                    // Đơn hàng hôm nay
    Long thisWeekOrders;                 // Đơn hàng tuần này
    Long thisMonthOrders;                // Đơn hàng tháng này
    Long lastMonthOrders;                // Đơn hàng tháng trước
    
    // Đơn hàng theo trạng thái
    Map<String, Long> ordersByStatus;
    
    // ==================== Doanh thu ====================
    BigDecimal totalRevenue;             // Tổng doanh thu (đơn DELIVERED)
    BigDecimal todayRevenue;             // Doanh thu hôm nay
    BigDecimal thisWeekRevenue;          // Doanh thu tuần này
    BigDecimal thisMonthRevenue;         // Doanh thu tháng này
    BigDecimal lastMonthRevenue;         // Doanh thu tháng trước
    BigDecimal avgOrderValue;            // Giá trị đơn hàng trung bình
    
    // Doanh thu theo tháng (12 tháng gần nhất)
    Map<String, BigDecimal> revenueByMonth;
    
    // Doanh thu theo ngày (30 ngày gần nhất)
    Map<String, BigDecimal> revenueByDay;
    
    // ==================== Sản phẩm bán chạy ====================
    List<TopProductDTO> topProducts;     // Top sản phẩm bán chạy nhất
    
    // ==================== Đơn hàng gần đây ====================
    List<RecentOrderDTO> recentOrders;   // 10 đơn hàng gần nhất
    
    // ==================== Tăng trưởng ====================
    Double orderGrowthPercent;           // % tăng trưởng đơn hàng so với tháng trước
    Double revenueGrowthPercent;         // % tăng trưởng doanh thu so với tháng trước
    
    // ==================== Thống kê khách hàng ====================
    Long totalCustomers;                 // Tổng số khách hàng đã mua
    Long newCustomersThisMonth;          // Khách hàng mới trong tháng
    Long returningCustomers;             // Khách hàng quay lại

    /**
     * DTO thông tin sản phẩm bán chạy
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TopProductDTO {
        String productId;
        String productName;
        String productImage;
        Long soldCount;                  // Số lượng đã bán
        BigDecimal totalRevenue;         // Tổng doanh thu
        Long orderCount;                 // Số đơn hàng chứa SP này
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
        String customerFullName;
        BigDecimal totalAmount;
        String status;
        String paymentStatus;
        String paymentMethod;
        String createdAt;
        Integer itemCount;
    }
}
