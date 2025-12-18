package com.cnweb.order_service.service;

import com.cnweb.order_service.client.BatchInventoryChangeRequest;
import com.cnweb.order_service.client.InventoryChangeRequest;
import com.cnweb.order_service.client.ProductClient;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.enums.PaymentStatus;
import com.cnweb.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    @Value("${timeout.order}")
    private int minute;
    /**
     * Run every minute to check for expired orders.
     * Expired orders are PENDING orders created more than 10 minutes ago.
     */
    @Scheduled(fixedRateString = "${schedule.order-cleanup}") // 1 minute
    @Transactional
    public void cancelExpiredOrders() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(minute);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, expirationTime);

        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("Found {} expired orders. Cancelling...", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                log.info("Cancelling expired order: {}", order.getOrderNumber());
                
                // 1. Release stock
                List<InventoryChangeRequest> inventoryChanges = new ArrayList<>();
                for (OrderItem item : order.getItems()) {
                    inventoryChanges.add(InventoryChangeRequest.builder()
                            .variantId(item.getVariantId())
                            .quantity(item.getQuantity())
                            .build());
                }
                
                try {
                    productClient.releaseBatch(BatchInventoryChangeRequest.builder()
                            .items(inventoryChanges)
                            .build());
                } catch (Exception e) {
                    log.error("Failed to release stock for expired order: {}", order.getOrderNumber(), e);
                    // Continue to cancel order even if stock release fails (or should we retry?)
                    // For now, we log and proceed to ensure order is cancelled.
                }

                // 2. Update order status
                order.setStatus(OrderStatus.CANCELLED);
                order.setPaymentStatus(PaymentStatus.UNPAID);
                order.setCancelReason("Hết thời gian thanh toán");
                order.setCancelledAt(LocalDateTime.now());
                order.setCancelledBy("SYSTEM");
                
            } catch (Exception e) {
                log.error("Error processing expired order: {}", order.getOrderNumber(), e);
            }
        }
        
        orderRepository.saveAll(expiredOrders);
    }
}
