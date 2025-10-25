package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.SellerProfileRejectedEvent;
import com.vdt2025.common_dto.dto.UserForgotPasswordEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message seller profile bị từ chối
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SellerProfileRejectedMessageHandler implements MessageHandler<SellerProfileRejectedEvent> {
    private final EmailService emailService;

    @Override
    public void handle(SellerProfileRejectedEvent payload) {
        log.info("Handling Seller profile rejected event for user: {}", payload.getContactEmail());

        try {
            emailService.sendSellerProfileRejectedEmail(
                    payload.getContactEmail(),
                    payload.getStoreName(),
                    payload.getRejectionReason(),
                    payload.getSellerProfileId(),
                    payload.getRejectedAt()
            );
            log.info("Successfully sent Seller profile rejected email to: {}", payload.getContactEmail());
        } catch (Exception e) {
            log.error("Failed to send Seller profile rejected email to: {}", payload.getContactEmail(), e);
            throw new RuntimeException("Failed to send Seller profile rejected email", e);
        }
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.SELLER_PROFILE_REJECTED;
    }

}
