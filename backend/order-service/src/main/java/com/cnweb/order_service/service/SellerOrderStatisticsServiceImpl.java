package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.response.SellerOrderStatisticsResponse;
import com.cnweb.order_service.dto.response.SellerOrderStatisticsResponse.RecentOrderDTO;
import com.cnweb.order_service.dto.response.SellerOrderStatisticsResponse.TopProductDTO;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation cho thống kê đơn hàng Seller Dashboard
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SellerOrderStatisticsServiceImpl implements SellerOrderStatisticsService {

    private final OrderRepository orderRepository;

    @Override
    @Cacheable(value = "seller-order-stats", key = "#storeId + '-' + #topProductsLimit", unless = "#result == null")
    public SellerOrderStatisticsResponse getOrderStatistics(String storeId, int topProductsLimit) {
        log.info("Computing order statistics for seller store: {}", storeId);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        // Lấy tên cửa hàng từ đơn hàng gần nhất
        String storeName = getStoreName(storeId);

        // Tổng quan đơn hàng
        long totalOrders = orderRepository.countByStoreId(storeId);
        long todayOrders = orderRepository.countByStoreIdAndCreatedAtAfter(storeId, startOfToday);
        long thisWeekOrders = orderRepository.countByStoreIdAndCreatedAtAfter(storeId, startOfWeek);
        long thisMonthOrders = orderRepository.countByStoreIdAndCreatedAtAfter(storeId, startOfMonth);
        long lastMonthOrders = orderRepository.countByStoreIdAndCreatedAtBetween(storeId, startOfLastMonth, endOfLastMonth);

        // Đơn hàng theo trạng thái
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.countByStoreIdAndStatus(storeId, status);
            ordersByStatus.put(status.name(), count);
        }

        // Doanh thu (chỉ tính đơn DELIVERED)
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStoreIdAndStatus(storeId, OrderStatus.DELIVERED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        BigDecimal todayRevenue = orderRepository.sumTotalAmountByStoreIdAndStatusAndCreatedAtAfter(
                storeId, OrderStatus.DELIVERED, startOfToday);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        
        BigDecimal thisWeekRevenue = orderRepository.sumTotalAmountByStoreIdAndStatusAndCreatedAtAfter(
                storeId, OrderStatus.DELIVERED, startOfWeek);
        if (thisWeekRevenue == null) thisWeekRevenue = BigDecimal.ZERO;
        
        BigDecimal thisMonthRevenue = orderRepository.sumTotalAmountByStoreIdAndStatusAndCreatedAtAfter(
                storeId, OrderStatus.DELIVERED, startOfMonth);
        if (thisMonthRevenue == null) thisMonthRevenue = BigDecimal.ZERO;
        
        BigDecimal lastMonthRevenue = orderRepository.sumTotalAmountByStoreIdAndStatusAndCreatedAtBetween(
                storeId, OrderStatus.DELIVERED, startOfLastMonth, endOfLastMonth);
        if (lastMonthRevenue == null) lastMonthRevenue = BigDecimal.ZERO;

        // Giá trị đơn hàng trung bình
        long deliveredOrders = ordersByStatus.getOrDefault(OrderStatus.DELIVERED.name(), 0L);
        BigDecimal avgOrderValue = deliveredOrders > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(deliveredOrders), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Doanh thu theo tháng (12 tháng gần nhất)
        Map<String, BigDecimal> revenueByMonth = getRevenueByPeriod(storeId, "monthly", 12);

        // Doanh thu theo ngày (30 ngày gần nhất)
        Map<String, BigDecimal> revenueByDay = getRevenueByPeriod(storeId, "daily", 1);

        // Top sản phẩm bán chạy
        List<TopProductDTO> topProducts = getTopProducts(storeId, topProductsLimit);

        // Đơn hàng gần đây
        List<RecentOrderDTO> recentOrders = getRecentOrders(storeId, 10);

        // Tính % tăng trưởng
        Double orderGrowthPercent = calculateGrowthPercent(thisMonthOrders, lastMonthOrders);
        Double revenueGrowthPercent = calculateGrowthPercent(
                thisMonthRevenue.doubleValue(), 
                lastMonthRevenue.doubleValue());

        // Thống kê khách hàng
        long totalCustomers = orderRepository.countDistinctCustomersByStoreIdAndStatus(storeId, OrderStatus.DELIVERED);
        long newCustomersThisMonth = 0L;
        long returningCustomers = 0L;
        
        try {
            newCustomersThisMonth = orderRepository.countNewCustomersByStoreIdAndStatusAfter(
                    storeId, OrderStatus.DELIVERED, startOfMonth);
        } catch (Exception e) {
            log.warn("Could not calculate new customers: {}", e.getMessage());
        }
        
        try {
            returningCustomers = orderRepository.countReturningCustomersByStoreIdAndStatus(
                    storeId, OrderStatus.DELIVERED.name());
        } catch (Exception e) {
            log.warn("Could not calculate returning customers: {}", e.getMessage());
        }

        return SellerOrderStatisticsResponse.builder()
                .storeId(storeId)
                .storeName(storeName)
                .totalOrders(totalOrders)
                .todayOrders(todayOrders)
                .thisWeekOrders(thisWeekOrders)
                .thisMonthOrders(thisMonthOrders)
                .lastMonthOrders(lastMonthOrders)
                .ordersByStatus(ordersByStatus)
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .thisWeekRevenue(thisWeekRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .lastMonthRevenue(lastMonthRevenue)
                .avgOrderValue(avgOrderValue)
                .revenueByMonth(revenueByMonth)
                .revenueByDay(revenueByDay)
                .topProducts(topProducts)
                .recentOrders(recentOrders)
                .orderGrowthPercent(orderGrowthPercent)
                .revenueGrowthPercent(revenueGrowthPercent)
                .totalCustomers(totalCustomers)
                .newCustomersThisMonth(newCustomersThisMonth)
                .returningCustomers(returningCustomers)
                .build();
    }

    @Override
    public Map<String, BigDecimal> getRevenueByPeriod(String storeId, String period, int months) {
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
                
                BigDecimal revenue = orderRepository.sumTotalAmountByStoreIdAndStatusAndCreatedAtBetween(
                        storeId, OrderStatus.DELIVERED, start, end);
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
                
                BigDecimal revenue = orderRepository.sumTotalAmountByStoreIdAndStatusAndCreatedAtBetween(
                        storeId, OrderStatus.DELIVERED, start, end);
                result.put(monthStart.format(formatter), revenue != null ? revenue : BigDecimal.ZERO);
            }
        }
        
        return result;
    }

    /**
     * Lấy tên cửa hàng từ đơn hàng
     */
    private String getStoreName(String storeId) {
        var orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(0, 1));
        if (!orders.isEmpty()) {
            return orders.getContent().get(0).getStoreName();
        }
        return "Cửa hàng";
    }

    /**
     * Lấy danh sách sản phẩm bán chạy
     */
    private List<TopProductDTO> getTopProducts(String storeId, int limit) {
        log.info("Fetching top {} products for store: {}", limit, storeId);
        
        List<Object[]> results = orderRepository.findTopProductsByStoreId(
                storeId, OrderStatus.DELIVERED, PageRequest.of(0, limit));
        
        return results.stream()
                .map(row -> TopProductDTO.builder()
                        .productId((String) row[0])
                        .productName((String) row[1])
                        .productImage((String) row[2])
                        .soldCount(((Number) row[3]).longValue())
                        .totalRevenue((BigDecimal) row[4])
                        .orderCount(((Number) row[5]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách đơn hàng gần đây
     */
    private List<RecentOrderDTO> getRecentOrders(String storeId, int limit) {
        var orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(0, limit));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        return orders.getContent().stream()
                .map(order -> RecentOrderDTO.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .customerUsername(order.getUsername())
                        .customerFullName(order.getReceiverName())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus().name())
                        .paymentStatus(order.getPaymentStatus().name())
                        .paymentMethod(order.getPaymentMethod().name())
                        .createdAt(order.getCreatedAt().format(formatter))
                        .itemCount(order.getItems() != null ? order.getItems().size() : 0)
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
