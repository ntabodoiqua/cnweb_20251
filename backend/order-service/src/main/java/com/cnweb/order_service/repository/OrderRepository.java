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
}
