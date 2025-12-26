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
 * Handler xử lý thông báo khi yêu cầu trả hàng bị từ chối
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderReturnRejectedMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_RETURN_REJECTED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_RETURN_REJECTED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho customer với idempotency check
            if (payload.getUsername() != null) {
                String message = String.format("Yêu cầu trả hàng cho đơn %s đã bị từ chối.",
                        payload.getOrderNumber());

                // cancelReason được sử dụng để lưu lý do từ chối
                if (payload.getCancelReason() != null && !payload.getCancelReason().isEmpty()) {
                    message += " Lý do: " + payload.getCancelReason();
                }

                message += " Nếu có thắc mắc, vui lòng liên hệ cửa hàng " + payload.getStoreName() + ".";

                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Yêu cầu trả hàng bị từ chối",
                        message,
                        NotificationType.REFUND_FAILED,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_RETURN_REJECTED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_RETURN_REJECTED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_RETURN_REJECTED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_RETURN_REJECTED;
    }
}