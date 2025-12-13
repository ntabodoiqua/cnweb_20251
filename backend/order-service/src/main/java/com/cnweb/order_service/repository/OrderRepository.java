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

    @Query(value = """
        WITH store_orders AS (
            SELECT
                id,
                store_id,
                created_at,
                total_amount,       
                subtotal,           
                discount_amount,    
                status,             
                payment_status,      
                refund_amount        
            FROM orders
            WHERE store_id = :storeId
        ),
        
        order_summary AS (
            SELECT
                COUNT(so.id) AS total_orders,
                COUNT(CASE WHEN so.status = 'DELIVERED' AND so.payment_status = 'PAID' THEN so.id END) AS total_completed_orders,
                COUNT(CASE WHEN so.status = 'CANCELLED' THEN so.id END) AS total_cancelled_orders,
                COUNT(CASE WHEN so.refund_amount > 0 THEN so.id END) AS total_refunded_orders_count, 
                
                COALESCE(SUM(so.total_amount), 0) AS total_net_revenue_raw, 
                COALESCE(SUM(so.subtotal), 0) AS total_gross_revenue,
                COALESCE(SUM(so.discount_amount), 0) AS total_discount_given,
                COALESCE(SUM(so.refund_amount), 0) AS total_refund_amount
            FROM store_orders so
        ),
        
        monthly_revenue AS (
            SELECT
                TO_CHAR(so.created_at, 'YYYY-MM') AS time_period,
                COALESCE(SUM(so.total_amount), 0) - COALESCE(SUM(so.refund_amount), 0) AS revenue
            FROM store_orders so
            WHERE so.status = 'DELIVERED' AND so.payment_status = 'PAID'
            GROUP BY time_period
            ORDER BY time_period
        ),
        
        product_revenue AS (
            SELECT
                oi.product_id,
                oi.product_name,
                COALESCE(SUM(oi.total_price), 0) - 
                COALESCE(SUM(so.discount_amount), 0) -
                COALESCE(SUM(so.refund_amount), 0) AS total_net_revenue
            FROM order_items oi
            JOIN store_orders so ON oi.order_id = so.id
            WHERE so.status = 'DELIVERED' AND so.payment_status = 'PAID' 
            GROUP BY oi.product_id, oi.product_name
            ORDER BY total_net_revenue DESC
            LIMIT 10
        )
        
        SELECT CAST(jsonb_build_object(
            'netRevenue', (SELECT total_net_revenue_raw - total_refund_amount FROM order_summary),
            'grossRevenue', (SELECT total_gross_revenue FROM order_summary),
            'discountGivenAmount', (SELECT total_discount_given FROM order_summary),
            'totalRefundAmount', (SELECT total_refund_amount FROM order_summary),
        
            'totalOrders', (SELECT total_orders FROM order_summary),
            'totalCompletedOrders', (SELECT total_completed_orders FROM order_summary),
            'totalCancelledOrders', (SELECT total_cancelled_orders FROM order_summary),
            'totalRefundedOrders', (SELECT total_refunded_orders_count FROM order_summary),
        
            'monthlyRevenueTrend', (SELECT jsonb_agg(jsonb_build_object(
                                        'timePeriod', mr.time_period,
                                        'revenue', mr.revenue
                                    ))
                                    FROM monthly_revenue mr),
        
            'topSellingProductsByRevenue', (SELECT jsonb_agg(jsonb_build_object(
                                                'productId', pr.product_id,
                                                'productName', pr.product_name,
                                                'totalNetRevenue', pr.total_net_revenue
                                            ))
                                            FROM product_revenue pr)
                                                                
        ) AS text) AS statistics;
        """, nativeQuery = true)
    String getOrderStatisticsJson(@Param("storeId") String storeId);
}
