package com.cnweb.order_service.messaging;

import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.enums.PaymentStatus;
import com.cnweb.order_service.repository.OrderRepository;
import com.vdt2025.common_dto.dto.PaymentSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final OrderRepository orderRepository;

    @RabbitListener(queues = "order-service-payment-success-queue")
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Received PaymentSuccessEvent for AppTransId: {}", event.getAppTransId());

        try {
            // Find orders by payment transaction ID
            List<Order> orders = orderRepository.findByPaymentTransactionId(event.getAppTransId());

            if (orders.isEmpty()) {
                log.warn("No orders found for PaymentTransactionId: {}", event.getAppTransId());
                return;
            }

            for (Order order : orders) {
                // Update payment status
                order.setPaymentStatus(PaymentStatus.PAID);
                
                // Update order status if it was PENDING
                if (order.getStatus() == OrderStatus.PENDING) {
                    // Set to CONFIRMED as payment is successful
                    order.setStatus(OrderStatus.CONFIRMED);
                    order.setConfirmedAt(LocalDateTime.now());
                }
                
                log.info("Updated Order {} to PAID/CONFIRMED", order.getOrderNumber());
            }

            orderRepository.saveAll(orders);
            log.info("Successfully updated {} orders for AppTransId: {}", orders.size(), event.getAppTransId());

        } catch (Exception e) {
            log.error("Error processing PaymentSuccessEvent: {}", e.getMessage(), e);
            // Throw exception to retry (RabbitMQ will retry based on config)
            throw e;
        }
    }

    @RabbitListener(queues = "order-service-payment-failed-queue")
    @Transactional
    public void handlePaymentFailed(com.vdt2025.common_dto.dto.PaymentFailedEvent event) {
        log.info("Received PaymentFailedEvent for AppTransId: {}, Reason: {}", event.getAppTransId(), event.getFailureReason());

        try {
            List<Order> orders = orderRepository.findByPaymentTransactionId(event.getAppTransId());

            if (orders.isEmpty()) {
                log.warn("No orders found for PaymentTransactionId: {}", event.getAppTransId());
                return;
            }

            for (Order order : orders) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                
                String note = order.getNote() != null ? order.getNote() : "";
                order.setNote(note + " | Payment failed: " + event.getFailureReason());
                
                log.info("Updated Order {} to PAYMENT_FAILED", order.getOrderNumber());
            }
            
            orderRepository.saveAll(orders);

        } catch (Exception e) {
            log.error("Error processing PaymentFailedEvent: {}", e.getMessage(), e);
        }
    }
}
