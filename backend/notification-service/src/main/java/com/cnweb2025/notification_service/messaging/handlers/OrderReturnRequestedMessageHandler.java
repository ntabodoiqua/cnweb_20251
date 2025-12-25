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
 * Handler xử lý thông báo khi có yêu cầu trả hàng mới (cho seller)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderReturnRequestedMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE_SELLER = "ORDER_RETURN_REQUESTED_SELLER";
    private static final String REFERENCE_TYPE_CUSTOMER = "ORDER_RETURN_REQUESTED_CUSTOMER";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling ORDER_RETURN_REQUESTED event for order: {}", payload.getOrderNumber());

        try {
            // Gửi push notification cho seller (thông báo có yêu cầu trả hàng) với idempotency
            // Sử dụng storeOwnerUsername (username của seller) thay vì storeId
            String sellerUsername = payload.getStoreOwnerUsername();
            if (sellerUsername != null && !sellerUsername.isEmpty()) {
                String returnReason = payload.getReturnReason() != null ? payload.getReturnReason() : "Không rõ";

                notificationService.createAndSendNotificationIdempotent(
                        sellerUsername,
                        "Yêu cầu trả hàng mới",
                        String.format("Đơn hàng %s có yêu cầu trả hàng từ khách hàng. Lý do: %s. Vui lòng xem xét và xử lý.",
                                payload.getOrderNumber(), returnReason),
                        NotificationType.NEW_ORDER,
                        "/seller/orders/" + payload.getOrderId() + "/returns",
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE_SELLER
                );
                log.info("Successfully processed ORDER_RETURN_REQUESTED notification for seller: {}", sellerUsername);
            } else {
                log.warn("No storeOwnerUsername found for order: {}. Cannot send notification to seller.", payload.getOrderNumber());
            }

            // Gửi xác nhận cho customer rằng yêu cầu đã được gửi với idempotency
            if (payload.getUsername() != null) {
                notificationService.createAndSendNotificationIdempotent(
                        payload.getUsername(),
                        "Yêu cầu trả hàng đã được gửi",
                        String.format("Yêu cầu trả hàng cho đơn %s đã được gửi đến cửa hàng %s. Vui lòng chờ xác nhận.",
                                payload.getOrderNumber(), payload.getStoreName()),
                        NotificationType.INFO,
                        "/profile/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE_CUSTOMER
                );
            }
        } catch (Exception e) {
            log.error("Failed to handle ORDER_RETURN_REQUESTED event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle ORDER_RETURN_REQUESTED event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.ORDER_RETURN_REQUESTED;
    }
}