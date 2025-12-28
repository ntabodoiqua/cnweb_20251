package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.response.AdminOrderStatisticsResponse;
import com.cnweb.order_service.dto.response.AdminOrderStatisticsResponse.RecentOrderDTO;
import com.cnweb.order_service.dto.response.AdminOrderStatisticsResponse.TopSellerDTO;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation cho thống kê đơn hàng Admin Dashboard
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminOrderStatisticsServiceImpl implements AdminOrderStatisticsService {

    private final OrderRepository orderRepository;

    @Override
    @Cacheable(value = "admin-order-stats", key = "#topSellersLimit", unless = "#result == null")
    public AdminOrderStatisticsResponse getOrderStatistics(int topSellersLimit) {
        log.info("Computing order statistics for admin dashboard");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        // Tổng quan đơn hàng
        long totalOrders = orderRepository.count();
        long todayOrders = orderRepository.countByCreatedAtAfter(startOfToday);
        long thisMonthOrders = orderRepository.countByCreatedAtAfter(startOfMonth);
        long lastMonthOrders = orderRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);

        // Đơn hàng theo trạng thái
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.countByStatus(status);
            ordersByStatus.put(status.name(), count);
        }

        // Doanh thu (chỉ tính đơn DELIVERED)
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        BigDecimal todayRevenue = orderRepository.sumTotalAmountByStatusAndCreatedAtAfter(
                OrderStatus.DELIVERED, startOfToday);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        
        BigDecimal thisMonthRevenue = orderRepository.sumTotalAmountByStatusAndCreatedAtAfter(
                OrderStatus.DELIVERED, startOfMonth);
        if (thisMonthRevenue == null) thisMonthRevenue = BigDecimal.ZERO;
        
        BigDecimal lastMonthRevenue = orderRepository.sumTotalAmountByStatusAndCreatedAtBetween(
                OrderStatus.DELIVERED, startOfLastMonth, endOfLastMonth);
        if (lastMonthRevenue == null) lastMonthRevenue = BigDecimal.ZERO;

        // Giá trị đơn hàng trung bình
        long deliveredOrders = ordersByStatus.getOrDefault(OrderStatus.DELIVERED.name(), 0L);
        BigDecimal avgOrderValue = deliveredOrders > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(deliveredOrders), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Doanh thu theo tháng (12 tháng gần nhất)
        Map<String, BigDecimal> revenueByMonth = getRevenueByPeriod("monthly", 12);

        // Doanh thu theo ngày (30 ngày gần nhất)
        Map<String, BigDecimal> revenueByDay = getRevenueByPeriod("daily", 1);

        // Top sellers
        List<TopSellerDTO> topSellers = getTopSellers(topSellersLimit);

        // Đơn hàng gần đây
        List<RecentOrderDTO> recentOrders = getRecentOrders(10);

        // Tính % tăng trưởng
        Double orderGrowthPercent = calculateGrowthPercent(thisMonthOrders, lastMonthOrders);
        Double revenueGrowthPercent = calculateGrowthPercent(
                thisMonthRevenue.doubleValue(), 
                lastMonthRevenue.doubleValue());

        return AdminOrderStatisticsResponse.builder()
                .totalOrders(totalOrders)
                .todayOrders(todayOrders)
                .thisMonthOrders(thisMonthOrders)
                .ordersByStatus(ordersByStatus)
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .lastMonthRevenue(lastMonthRevenue)
                .avgOrderValue(avgOrderValue)
                .revenueByMonth(revenueByMonth)
                .revenueByDay(revenueByDay)
                .topSellers(topSellers)
                .recentOrders(recentOrders)
                .orderGrowthPercent(orderGrowthPercent)
                .revenueGrowthPercent(revenueGrowthPercent)
                .build();
    }

    @Override
    @Cacheable(value = "top-sellers", key = "#limit", unless = "#result == null || #result.isEmpty()")
    public List<TopSellerDTO> getTopSellers(int limit) {
        log.info("Fetching top {} sellers by revenue", limit);
        
        List<Object[]> results = orderRepository.findTopSellersByRevenue(
                OrderStatus.DELIVERED, 
                PageRequest.of(0, limit));
        
        return results.stream()
                .map(row -> TopSellerDTO.builder()
                        .storeId((String) row[0])
                        .storeName((String) row[1])
                        .storeOwnerUsername((String) row[2])
                        .totalOrders(((Number) row[3]).longValue())
                        .totalRevenue((BigDecimal) row[4])
                        .deliveredOrders(((Number) row[5]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, BigDecimal> getRevenueByPeriod(String period, int months) {
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter;
        
        if ("daily".equalsIgnoreCase(period)) {
            // 30 ngày gần nhất
            formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            for (int i = 29; i >= 0; i--) {
                LocalDate date = now.minusDays(i);
                LocalDateTime start = date.atStartOfDay();
                LocalDateTime end = date.plusDays(1).atStartOfDay();
                
                BigDecimal revenue = orderRepository.sumTotalAmountByStatusAndCreatedAtBetween(
                        OrderStatus.DELIVERED, start, end);
                result.put(date.format(formatter), revenue != null ? revenue : BigDecimal.ZERO);
            }
        } else {
            // Monthly - N tháng gần nhất
            formatter = DateTimeFormatter.ofPattern("yyyy-MM");
            for (int i = months - 1; i >= 0; i--) {
                LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
                LocalDate monthEnd = monthStart.plusMonths(1);
                
                LocalDateTime start = monthStart.atStartOfDay();
                LocalDateTime end = monthEnd.atStartOfDay();
                
                BigDecimal revenue = orderRepository.sumTotalAmountByStatusAndCreatedAtBetween(
                        OrderStatus.DELIVERED, start, end);
                result.put(monthStart.format(formatter), revenue != null ? revenue : BigDecimal.ZERO);
            }
        }
        
        return result;
    }

    /**
     * Lấy danh sách đơn hàng gần đây
     */
    private List<RecentOrderDTO> getRecentOrders(int limit) {
        List<Order> orders = orderRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        return orders.stream()
                .map(order -> RecentOrderDTO.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .customerUsername(order.getUsername())
                        .storeName(order.getStoreName())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus().name())
                        .paymentStatus(order.getPaymentStatus().name())
                        .createdAt(order.getCreatedAt().format(formatter))
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Tính phần trăm tăng trưởng
     */
    private Double calculateGrowthPercent(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((current - previous) / previous) * 10000.0) / 100.0; // Làm tròn 2 chữ số
    }
}
