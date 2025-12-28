package com.cnweb.order_service.repository;

import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * OrderRepository - Repository cho Order entity
 * Sử dụng JpaSpecificationExecutor để hỗ trợ dynamic queries
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    
    /**
     * Tìm đơn hàng theo ID và fetch items để tránh LazyInitializationException
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") String orderId);

    /**
     * Tìm đơn hàng theo mã giao dịch thanh toán
     */
    List<Order> findByPaymentTransactionId(String paymentTransactionId);

    /**
     * Tìm các đơn hàng theo trạng thái và thời gian tạo trước một mốc thời gian
     */
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime dateTime);

    /**
     * Kiểm tra user đã mua sản phẩm (đơn hàng DELIVERED) chưa
     */
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i " +
           "WHERE o.username = :username AND i.productId = :productId AND o.status = :status")
    boolean existsByUsernameAndProductIdAndStatus(
            @Param("username") String username,
            @Param("productId") String productId,
            @Param("status") OrderStatus status);

    /**
     * Lấy orderId của đơn hàng DELIVERED chứa sản phẩm mà user đã mua
     */
    @Query("SELECT o.id FROM Order o JOIN o.items i " +
           "WHERE o.username = :username AND i.productId = :productId AND o.status = :status " +
           "ORDER BY o.createdAt DESC")
    List<String> findOrderIdsByUsernameAndProductIdAndStatus(
            @Param("username") String username,
            @Param("productId") String productId,
            @Param("status") OrderStatus status);

    // ==================== Admin Statistics Queries ====================

    /**
     * Đếm số đơn hàng theo trạng thái
     */
    long countByStatus(OrderStatus status);

    /**
     * Đếm số đơn hàng sau một thời điểm
     */
    long countByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Đếm số đơn hàng trong khoảng thời gian
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Tính tổng doanh thu theo trạng thái
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);

    /**
     * Tính tổng doanh thu theo trạng thái và sau một thời điểm
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status AND o.createdAt >= :dateTime")
    BigDecimal sumTotalAmountByStatusAndCreatedAtAfter(
            @Param("status") OrderStatus status,
            @Param("dateTime") LocalDateTime dateTime);

    /**
     * Tính tổng doanh thu theo trạng thái và trong khoảng thời gian
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status AND o.createdAt >= :start AND o.createdAt < :end")
    BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(
            @Param("status") OrderStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Lấy top sellers theo doanh thu (đơn DELIVERED)
     * Returns: storeId, storeName, storeOwnerUsername, totalOrders, totalRevenue, deliveredOrders
     * Chỉ GROUP BY storeId để tránh lặp cửa hàng
     */
    @Query("""
        SELECT o.storeId, MAX(o.storeName) as storeName, MAX(o.storeOwnerUsername) as storeOwnerUsername, 
               COUNT(o) as totalOrders,
               SUM(CASE WHEN o.status = :deliveredStatus THEN o.totalAmount ELSE 0 END) as totalRevenue,
               SUM(CASE WHEN o.status = :deliveredStatus THEN 1 ELSE 0 END) as deliveredOrders
        FROM Order o
        GROUP BY o.storeId
        ORDER BY totalRevenue DESC
    """)
    List<Object[]> findTopSellersByRevenue(
            @Param("deliveredStatus") OrderStatus deliveredStatus,
            Pageable pageable);

    /**
     * Thống kê doanh thu theo tháng
     */
    @Query("""
        SELECT FUNCTION('TO_CHAR', o.createdAt, 'YYYY-MM') as month, 
               COALESCE(SUM(o.totalAmount), 0) as revenue
        FROM Order o
        WHERE o.status = :status AND o.createdAt >= :startDate
        GROUP BY FUNCTION('TO_CHAR', o.createdAt, 'YYYY-MM')
        ORDER BY month
    """)
    List<Object[]> getRevenueByMonth(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate);
}
