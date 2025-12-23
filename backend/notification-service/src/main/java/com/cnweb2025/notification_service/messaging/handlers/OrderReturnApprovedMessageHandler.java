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
 * Handler xử lý thông báo khi yêu cầu trả hàng được chấp nhận
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderReturnApprovedMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "ORDER_RETURN_APPROVED";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_RETURN_APPROVED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho customer với idempotency check
            if (payload.getUsername() != null) {
                String message = String.format("Yêu cầu trả hàng cho đơn %s đã được chấp nhận.",
                        payload.getOrderNumber());

                if (payload.getRefundAmount() != null && payload.getRefundAmount().doubleValue() > 0) {
                    String formattedRefund = String.format("%,.0f VNĐ", payload.getRefundAmount());
                    message += String.format(" Số tiền hoàn lại: %s. Tiền sẽ được hoàn về tài khoản của bạn trong 3-5 ngày làm việc.",
                            formattedRefund);
                }

                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Yêu cầu trả hàng được chấp nhận",
                        message,
                        NotificationType.REFUND_SUCCESS,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed ORDER_RETURN_APPROVED notification for user: {}", payload.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_RETURN_APPROVED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_RETURN_APPROVED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_RETURN_APPROVED;
    }
}