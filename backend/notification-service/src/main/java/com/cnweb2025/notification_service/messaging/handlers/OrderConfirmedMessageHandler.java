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
 * Handler xử lý thông báo khi đơn hàng được xác nhận bởi seller
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConfirmedMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_CONFIRMED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_CONFIRMED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho customer với idempotency check
            if (payload.getUsername() != null) {
                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Đơn hàng đã được xác nhận",
                        String.format("Đơn hàng %s đã được cửa hàng %s xác nhận và đang chuẩn bị hàng.",
                                payload.getOrderNumber(), payload.getStoreName()),
                        NotificationType.ORDER_CONFIRMED,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_CONFIRMED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_CONFIRMED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_CONFIRMED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_CONFIRMED;
    }
}