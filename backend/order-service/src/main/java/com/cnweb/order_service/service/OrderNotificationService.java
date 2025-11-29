package com.cnweb.order_service.service;

import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
import com.cnweb.order_service.messaging.OrderEventPublisher;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.OrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service để gửi thông báo cho các sự kiện đơn hàng
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationService {

    private final OrderEventPublisher orderEventPublisher;

    /**
     * Gửi thông báo khi đơn hàng được tạo mới
     */
    @Async
    public void notifyOrderCreated(Order order, String email) {
        log.info("Sending ORDER_CREATED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, email);
        
        // Gửi thông báo cho customer
        orderEventPublisher.publish(MessageType.ORDER_CREATED, event);
        
        // Gửi thông báo cho seller (cửa hàng có đơn mới)
        orderEventPublisher.publish(MessageType.SELLER_NEW_ORDER, event);
        
        log.info("ORDER_CREATED notifications sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi đơn hàng được xác nhận bởi seller
     */
    @Async
    public void notifyOrderConfirmed(Order order) {
        log.info("Sending ORDER_CONFIRMED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        orderEventPublisher.publish(MessageType.ORDER_CONFIRMED, event);
        
        log.info("ORDER_CONFIRMED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi đơn hàng được giao cho vận chuyển
     */
    @Async
    public void notifyOrderShipped(Order order) {
        log.info("Sending ORDER_SHIPPED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        orderEventPublisher.publish(MessageType.ORDER_SHIPPED, event);
        
        log.info("ORDER_SHIPPED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi đơn hàng giao thành công
     */
    @Async
    public void notifyOrderDelivered(Order order) {
        log.info("Sending ORDER_DELIVERED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        
        // Thông báo cho customer
        orderEventPublisher.publish(MessageType.ORDER_DELIVERED, event);
        
        log.info("ORDER_DELIVERED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi đơn hàng bị hủy
     */
    @Async
    public void notifyOrderCancelled(Order order, String cancelledBy) {
        log.info("Sending ORDER_CANCELLED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        event.setCancelReason(order.getCancelReason());
        event.setCancelledBy(cancelledBy);
        
        // Thông báo cho customer
        orderEventPublisher.publish(MessageType.ORDER_CANCELLED, event);
        
        log.info("ORDER_CANCELLED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi yêu cầu trả hàng được gửi
     */
    @Async
    public void notifyReturnRequested(Order order) {
        log.info("Sending ORDER_RETURN_REQUESTED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        event.setReturnReason(order.getReturnReason() != null ? order.getReturnReason().name() : null);
        
        // Thông báo cho seller (có yêu cầu trả hàng mới)
        orderEventPublisher.publish(MessageType.ORDER_RETURN_REQUESTED, event);
        
        log.info("ORDER_RETURN_REQUESTED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi yêu cầu trả hàng được chấp nhận
     */
    @Async
    public void notifyReturnApproved(Order order) {
        log.info("Sending ORDER_RETURN_APPROVED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        event.setReturnReason(order.getReturnReason() != null ? order.getReturnReason().name() : null);
        event.setRefundStatus(order.getRefundStatus() != null ? order.getRefundStatus().name() : null);
        event.setRefundAmount(order.getRefundAmount());
        
        // Thông báo cho customer
        orderEventPublisher.publish(MessageType.ORDER_RETURN_APPROVED, event);
        
        log.info("ORDER_RETURN_APPROVED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Gửi thông báo khi yêu cầu trả hàng bị từ chối
     */
    @Async
    public void notifyReturnRejected(Order order, String rejectionReason) {
        log.info("Sending ORDER_RETURN_REJECTED notification for order: {}", order.getOrderNumber());
        
        OrderEvent event = buildOrderEvent(order, order.getReceiverEmail());
        event.setReturnReason(order.getReturnReason() != null ? order.getReturnReason().name() : null);
        event.setCancelReason(rejectionReason); // Sử dụng cancelReason để lưu lý do từ chối
        
        // Thông báo cho customer
        orderEventPublisher.publish(MessageType.ORDER_RETURN_REJECTED, event);
        
        log.info("ORDER_RETURN_REJECTED notification sent for order: {}", order.getOrderNumber());
    }

    /**
     * Build OrderEvent từ Order entity
     */
    private OrderEvent buildOrderEvent(Order order, String email) {
        List<OrderEvent.OrderItemEvent> itemEvents = order.getItems().stream()
                .map(this::buildOrderItemEvent)
                .collect(Collectors.toList());
        
        return OrderEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .username(order.getUsername())
                .email(email)
                .storeId(order.getStoreId())
                .storeName(order.getStoreName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .createdAt(order.getCreatedAt())
                .eventTime(LocalDateTime.now())
                .items(itemEvents)
                .build();
    }

    /**
     * Build OrderItemEvent từ OrderItem entity
     */
    private OrderEvent.OrderItemEvent buildOrderItemEvent(OrderItem item) {
        return OrderEvent.OrderItemEvent.builder()
                .productId(item.getProductId())
                .productName(item.getProductName())
                .variantName(item.getVariantName())
                .productImage(item.getProductImage())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .build();
    }
}
