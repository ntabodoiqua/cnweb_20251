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
 * Handler xử lý thông báo khi đơn hàng được giao cho đơn vị vận chuyển
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderShippedMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_SHIPPED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_SHIPPED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho customer với idempotency check
            if (payload.getUsername() != null) {
                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Đơn hàng đang được giao",
                        String.format("Đơn hàng %s đang trên đường giao đến bạn. Địa chỉ: %s",
                                payload.getOrderNumber(), payload.getShippingAddress()),
                        NotificationType.ORDER_SHIPPED,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_SHIPPED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_SHIPPED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_SHIPPED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_SHIPPED;
    }
}