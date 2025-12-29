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

    // ==================== Seller Statistics Queries ====================

    /**
     * Đếm số đơn hàng của cửa hàng theo trạng thái
     */
    long countByStoreIdAndStatus(String storeId, OrderStatus status);

    /**
     * Đếm tổng số đơn hàng của cửa hàng
     */
    long countByStoreId(String storeId);

    /**
     * Đếm số đơn hàng của cửa hàng sau một thời điểm
     */
    long countByStoreIdAndCreatedAtAfter(String storeId, LocalDateTime dateTime);

    /**
     * Đếm số đơn hàng của cửa hàng trong khoảng thời gian
     */
    long countByStoreIdAndCreatedAtBetween(String storeId, LocalDateTime start, LocalDateTime end);

    /**
     * Tính tổng doanh thu của cửa hàng theo trạng thái
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.storeId = :storeId AND o.status = :status")
    BigDecimal sumTotalAmountByStoreIdAndStatus(
            @Param("storeId") String storeId,
            @Param("status") OrderStatus status);

    /**
     * Tính tổng doanh thu của cửa hàng theo trạng thái và sau một thời điểm
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.storeId = :storeId AND o.status = :status AND o.createdAt >= :dateTime")
    BigDecimal sumTotalAmountByStoreIdAndStatusAndCreatedAtAfter(
            @Param("storeId") String storeId,
            @Param("status") OrderStatus status,
            @Param("dateTime") LocalDateTime dateTime);

    /**
     * Tính tổng doanh thu của cửa hàng theo trạng thái và trong khoảng thời gian
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.storeId = :storeId AND o.status = :status AND o.createdAt >= :start AND o.createdAt < :end")
    BigDecimal sumTotalAmountByStoreIdAndStatusAndCreatedAtBetween(
            @Param("storeId") String storeId,
            @Param("status") OrderStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * Lấy top sản phẩm bán chạy của cửa hàng
     * Returns: productId, productName, productImage, soldCount, totalRevenue, orderCount
     */
    @Query("""
        SELECT i.productId, MAX(i.productName) as productName, MAX(i.productImage) as productImage,
               SUM(i.quantity) as soldCount,
               SUM(i.price * i.quantity) as totalRevenue,
               COUNT(DISTINCT o.id) as orderCount
        FROM Order o JOIN o.items i
        WHERE o.storeId = :storeId AND o.status = :deliveredStatus
        GROUP BY i.productId
        ORDER BY soldCount DESC
    """)
    List<Object[]> findTopProductsByStoreId(
            @Param("storeId") String storeId,
            @Param("deliveredStatus") OrderStatus deliveredStatus,
            Pageable pageable);

    /**
     * Lấy danh sách đơn hàng gần đây của cửa hàng
     */
    Page<Order> findByStoreIdOrderByCreatedAtDesc(String storeId, Pageable pageable);

    /**
     * Đếm số khách hàng unique của cửa hàng
     */
    @Query("SELECT COUNT(DISTINCT o.username) FROM Order o WHERE o.storeId = :storeId AND o.status = :status")
    long countDistinctCustomersByStoreIdAndStatus(
            @Param("storeId") String storeId,
            @Param("status") OrderStatus status);

    /**
     * Đếm số khách hàng mới trong khoảng thời gian
     */
    @Query("""
        SELECT COUNT(DISTINCT o.username) FROM Order o 
        WHERE o.storeId = :storeId AND o.status = :status AND o.createdAt >= :startDate
        AND o.username NOT IN (
            SELECT DISTINCT o2.username FROM Order o2 
            WHERE o2.storeId = :storeId AND o2.status = :status AND o2.createdAt < :startDate
        )
    """)
    long countNewCustomersByStoreIdAndStatusAfter(
            @Param("storeId") String storeId,
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate);

    /**
     * Đếm số khách hàng quay lại (mua > 1 lần) - sử dụng native query
     */
    @Query(value = """
        SELECT COUNT(*) FROM (
            SELECT o.username 
            FROM orders o 
            WHERE o.store_id = :storeId AND o.status = :status
            GROUP BY o.username
            HAVING COUNT(o.id) > 1
        ) AS returning_customers
    """, nativeQuery = true)
    long countReturningCustomersByStoreIdAndStatus(
            @Param("storeId") String storeId,
            @Param("status") String status);

    /**
     * Lấy thông tin cửa hàng từ đơn hàng
     */
    @Query("SELECT o.storeId, o.storeName FROM Order o WHERE o.storeOwnerUsername = :username ORDER BY o.createdAt DESC")
    List<Object[]> findStoreInfoByOwnerUsername(@Param("username") String username, Pageable pageable);
}
