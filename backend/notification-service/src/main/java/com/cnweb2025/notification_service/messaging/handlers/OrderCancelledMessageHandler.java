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
 * Handler xử lý thông báo khi đơn hàng bị hủy
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCancelledMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_CANCELLED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_CANCELLED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho customer với idempotency check
            if (payload.getUsername() != null) {
                String message = String.format("Đơn hàng %s đã bị hủy.", payload.getOrderNumber());
                if (payload.getCancelReason() != null && !payload.getCancelReason().isEmpty()) {
                    message += " Lý do: " + payload.getCancelReason();
                }
                if (payload.getRefundAmount() != null && payload.getRefundAmount().doubleValue() > 0) {
                    String formattedRefund = String.format("%,.0f VNĐ", payload.getRefundAmount());
                    message += " Số tiền hoàn lại: " + formattedRefund;
                }

                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Đơn hàng đã hủy",
                        message,
                        NotificationType.ORDER_CANCELLED,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_CANCELLED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_CANCELLED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_CANCELLED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_CANCELLED;
    }
}