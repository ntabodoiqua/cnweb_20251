package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatisticResponse {
    BigDecimal netRevenue;           // Doanh thu ròng (đã trừ hoàn tiền)
    BigDecimal grossRevenue;         // Tổng doanh thu (trước chiết khấu)
    BigDecimal discountGivenAmount;  // Tổng chiết khấu đã áp dụng
    BigDecimal totalRefundAmount;    // Tổng số tiền đã hoàn lại

    Long totalOrders;
    Long totalCompletedOrders;
    Long totalCancelledOrders;
    Long totalRefundedOrders;

    // Doanh thu theo tháng
    List<RevenueByTime> monthlyRevenueTrend;

    // Top sản phẩm bán chạy theo doanh thu
    List<ProductRevenueSummary> topSellingProductsByRevenue;

    @Data
    public static class RevenueByTime {
        String timePeriod;
        BigDecimal revenue;
    }

    @Data
    public static class ProductRevenueSummary {
        String productId;
        String productName;
        BigDecimal totalNetRevenue;
    }
}
