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

}
