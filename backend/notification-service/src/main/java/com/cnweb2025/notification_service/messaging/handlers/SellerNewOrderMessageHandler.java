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
 * Handler xử lý thông báo khi có đơn hàng mới cho seller
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SellerNewOrderMessageHandler implements MessageHandler<OrderEvent> {

    private final NotificationService notificationService;
    private static final String REFERENCE_TYPE = "SELLER_NEW_ORDER";

    @Override
    public void handle(OrderEvent payload) {
        log.info("Handling SELLER_NEW_ORDER event for order: {}", payload.getOrderNumber());

        try {
            String formattedAmount = String.format("%,.0f VNĐ", payload.getTotalAmount());
            
            // Gửi push notification cho seller với idempotency check
            if (payload.getStoreId() != null) {
                notificationService.createAndSendNotificationIdempotent(
                        payload.getStoreId(),
                        "Đơn hàng mới",
                        String.format("Bạn có đơn hàng mới %s từ %s. Giá trị: %s. Vui lòng xác nhận đơn hàng.",
                                payload.getOrderNumber(), 
                                payload.getReceiverName() != null ? payload.getReceiverName() : "khách hàng",
                                formattedAmount),
                        NotificationType.NEW_ORDER,
                        "/seller/orders/" + payload.getOrderId(),
                        null,
                        payload.getOrderId(),
                        REFERENCE_TYPE
                );
                log.info("Successfully processed SELLER_NEW_ORDER notification for store: {}", payload.getStoreId());
            }
        } catch (Exception e) {
            log.error("Failed to handle SELLER_NEW_ORDER event for order: {}", payload.getOrderNumber(), e);
            throw new RuntimeException("Failed to handle SELLER_NEW_ORDER event", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.SELLER_NEW_ORDER;
    }
}
