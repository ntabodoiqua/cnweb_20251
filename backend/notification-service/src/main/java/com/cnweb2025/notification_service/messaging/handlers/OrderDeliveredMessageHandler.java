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
 * Handler xử lý thông báo khi đơn hàng được giao thành công
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderDeliveredMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_DELIVERED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_DELIVERED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho customer với idempotency check
            if (payload.getUsername() != null) {
                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Giao hàng thành công",
                        String.format("Đơn hàng %s đã được giao thành công. Cảm ơn bạn đã mua hàng! Hãy đánh giá sản phẩm để nhận ưu đãi.",
                                payload.getOrderNumber()),
                        NotificationType.ORDER_DELIVERED,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_DELIVERED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_DELIVERED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_DELIVERED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_DELIVERED;
    }
}
