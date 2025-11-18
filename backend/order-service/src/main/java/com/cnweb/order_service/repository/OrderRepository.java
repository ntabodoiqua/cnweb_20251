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
     * Tìm order theo order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Tìm tất cả orders của user
     */
    Page<Order> findByUserId(String userId, Pageable pageable);

    /**
     * Tìm orders của user theo status
     */
    Page<Order> findByUserIdAndStatus(String userId, OrderStatus status, Pageable pageable);

    /**
     * Tìm orders của store
     */
    Page<Order> findByStoreId(String storeId, Pageable pageable);

    /**
     * Tìm orders của store theo status
     */
    Page<Order> findByStoreIdAndStatus(String storeId, OrderStatus status, Pageable pageable);

    /**
     * Tìm orders theo coupon code
     */
    List<Order> findByCouponCode(String couponCode);

    /**
     * Đếm số orders của user theo status
     */
    long countByUserIdAndStatus(String userId, OrderStatus status);

    /**
     * Đếm số orders của store theo status
     */
    long countByStoreIdAndStatus(String storeId, OrderStatus status);

    /**
     * Tìm orders trong khoảng thời gian
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findOrdersBetweenDates(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Tính tổng doanh thu của store
     */
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.storeId = :storeId AND o.status = :status")
    Optional<Double> calculateTotalRevenueByStore(
        @Param("storeId") String storeId, 
        @Param("status") OrderStatus status
    );

    /**
     * Kiểm tra user đã mua sản phẩm chưa (để có thể review)
     */
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items oi " +
           "WHERE o.userId = :userId AND oi.productId = :productId " +
           "AND o.status = com.cnweb.order_service.enums.OrderStatus.DELIVERED")
    boolean hasUserPurchasedProduct(@Param("userId") String userId, @Param("productId") String productId);

    /**
     * Tìm orders cần xử lý (đã pending quá lâu)
     */
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt < :beforeDate")
    List<Order> findStaleOrders(@Param("status") OrderStatus status, @Param("beforeDate") LocalDateTime beforeDate);
}
