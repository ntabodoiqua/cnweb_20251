package com.cnweb.order_service.repository;

import com.cnweb.order_service.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.cnweb.order_service.enums.OrderStatus;

import java.util.List;

/**
 * OrderItemRepository - Repository cho OrderItem entity
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

    /**
     * Tìm tất cả items của một order
     */
    List<OrderItem> findByOrderId(String orderId);

    /**
     * Tìm tất cả orders chứa một product cụ thể
     */
    List<OrderItem> findByProductId(String productId);

    /**
     * Tìm tất cả orders chứa một variant cụ thể
     */
    List<OrderItem> findByVariantId(String variantId);

    /**
     * Tính tổng số lượng đã bán của một product
     */
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi " +
           "WHERE oi.productId = :productId " +
           "AND oi.order.status = com.cnweb.order_service.enums.OrderStatus.DELIVERED")
    Integer getTotalSoldQuantityByProduct(@Param("productId") String productId);

    /**
     * Tính tổng số lượng đã bán của một variant
     */
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi " +
           "WHERE oi.variantId = :variantId " +
           "AND oi.order.status = com.cnweb.order_service.enums.OrderStatus.DELIVERED")
    Integer getTotalSoldQuantityByVariant(@Param("variantId") String variantId);
}
