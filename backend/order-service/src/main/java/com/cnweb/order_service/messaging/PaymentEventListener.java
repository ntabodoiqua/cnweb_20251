package com.cnweb.order_service.messaging;

import com.cnweb.order_service.client.BatchInventoryChangeRequest;
import com.cnweb.order_service.client.InventoryChangeRequest;
import com.cnweb.order_service.client.ProductClient;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
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
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

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
                // Idempotency check: Skip if already PAID
                if (order.getPaymentStatus() == PaymentStatus.PAID) {
                    log.info("Order {} already PAID. Skip processing.", order.getOrderNumber());
                    continue;
                }

                // Update payment status
                order.setPaymentStatus(PaymentStatus.PAID);

                // Update order status if it was PENDING
                if (order.getStatus() == OrderStatus.PENDING) {
                    // Set to PAID as payment is successful
                    order.setStatus(OrderStatus.PAID);
                    order.setPaidAt(LocalDateTime.now());
                }

                log.info("Updated Order {} to PAID", order.getOrderNumber());

                // Gọi API confirm-batch để chốt đơn hàng trong product-service
                try {
                    List<InventoryChangeRequest> items = order.getItems().stream()
                            .map(item -> InventoryChangeRequest.builder()
                                    .variantId(item.getVariantId())
                                    .quantity(item.getQuantity())
                                    .build())
                            .collect(Collectors.toList());

                    BatchInventoryChangeRequest confirmRequest = BatchInventoryChangeRequest.builder()
                            .items(items)
                            .build();

                    productClient.confirmBatch(confirmRequest);
                    log.info("Successfully confirmed batch for Order {}", order.getOrderNumber());
                } catch (Exception e) {
                    log.error("Failed to confirm batch for Order {}: {}", order.getOrderNumber(), e.getMessage(), e);
                    // Không throw exception ở đây để không làm rollback transaction của order
                    // Order đã PAID nhưng inventory chưa confirm, cần xử lý manual hoặc retry mechanism
                }
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
                // Idempotency check: Skip if already FAILED or PAID
                if (order.getPaymentStatus() == PaymentStatus.FAILED) {
                    log.info("Order {} already FAILED. Skip processing.", order.getOrderNumber());
                    continue;
                }
                if (order.getPaymentStatus() == PaymentStatus.PAID) {
                    log.warn("Order {} already PAID. Cannot mark as FAILED. Skip processing.", order.getOrderNumber());
                    continue;
                }

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
