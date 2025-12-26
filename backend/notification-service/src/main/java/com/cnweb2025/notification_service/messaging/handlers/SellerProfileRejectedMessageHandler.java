package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.entity.NotificationType;
import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.cnweb2025.notification_service.service.NotificationService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.SellerProfileRejectedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message seller profile bị từ chối
 * Gửi email và push notification
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SellerProfileRejectedMessageHandler implements MessageHandler<SellerProfileRejectedEvent> {
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    public void handle(SellerProfileRejectedEvent payload) {
        log.info("Handling Seller profile rejected event for user: {}", payload.getContactEmail());

        try {
            // Gửi email
            emailService.sendSellerProfileRejectedEmail(
                    payload.getContactEmail(),
                    payload.getStoreName(),
                    payload.getRejectionReason(),
                    payload.getSellerProfileId(),
                    payload.getRejectedAt()
            );
            log.info("Successfully sent Seller profile rejected email to: {}", payload.getContactEmail());

            // Gửi push notification
            if (payload.getUserId() != null) {
                notificationService.createAndSendNotification(
                        payload.getUserId(),
                        "Hồ sơ người bán bị từ chối",
                        String.format("Hồ sơ bán hàng '%s' của bạn đã bị từ chối. Lý do: %s",
                                payload.getStoreName(), payload.getRejectionReason()),
                        NotificationType.SELLER_REJECTED,
                        "/profile/seller",
                        null
                );
                log.info("Successfully sent push notification to user: {}", payload.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to send Seller profile rejected notification to: {}", payload.getContactEmail(), e);
            throw new RuntimeException("Failed to send Seller profile rejected notification", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.SELLER_PROFILE_REJECTED;
    }
}