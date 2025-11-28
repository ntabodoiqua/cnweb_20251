package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.entity.NotificationType;
import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.cnweb2025.notification_service.service.NotificationService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.StoreCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message khi store được tạo thành công
 * Gửi email và push notification cho seller
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StoreCreatedMessageHandler implements MessageHandler<StoreCreatedEvent> {
    
    private final EmailService emailService;
    private final NotificationService notificationService;
    
    @Override
    public void handle(StoreCreatedEvent payload) {
        log.info("Handling STORE_CREATED event for store: {}", payload.getStoreName());
        
        try {
            // Gửi email
            emailService.sendStoreCreatedEmail(
                payload.getContactEmail(),
                payload.getStoreName()
            );
            log.info("Successfully sent store created email to: {}", payload.getContactEmail());
            
            // Gửi push notification
            if (payload.getUserId() != null) {
                notificationService.createAndSendNotification(
                    payload.getUserId(),
                    "Cửa hàng được tạo thành công",
                    String.format("Chúc mừng! Cửa hàng '%s' của bạn đã được tạo thành công.", payload.getStoreName()),
                    NotificationType.STORE_CREATED,
                    "/seller/stores",
                    null
                );
                log.info("Successfully sent push notification to user: {}", payload.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to send store created notification to: {}", payload.getContactEmail(), e);
            throw new RuntimeException("Failed to send store created notification", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.STORE_CREATED;
    }
}
