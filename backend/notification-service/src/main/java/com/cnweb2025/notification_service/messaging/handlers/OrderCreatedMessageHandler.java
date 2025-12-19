package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.entity.NotificationType;
import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.NotificationService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.OrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý thông báo khi có đơn hàng mới được tạo
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_CREATED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_CREATED event for order: {}", payload.getOrderNumber());

        try {
            String formattedAmount = String.format("%,.0f VNĐ", payload.getTotalAmount());
            
            // Gửi push notification cho customer (với idempotency check)
            if (payload.getUsername() != null) {
                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Đặt hàng thành công",
                        String.format("Đơn hàng %s đã được tạo thành công. Tổng tiền: %s. Vui lòng thanh toán để hoàn tất đơn hàng.",
                                payload.getOrderNumber(), formattedAmount),
                        NotificationType.ORDER_PLACED,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_CREATED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_CREATED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_CREATED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_CREATED;
    }
}
