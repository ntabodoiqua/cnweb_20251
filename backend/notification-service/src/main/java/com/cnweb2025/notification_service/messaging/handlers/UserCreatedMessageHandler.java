package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message khi user được tạo
 * Gửi welcome email với OTP
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserCreatedMessageHandler implements MessageHandler<UserCreatedEvent> {
    
    private final EmailService emailService;
    
    @Override
    public void handle(UserCreatedEvent payload) {
        log.info("Handling USER_CREATED event for user: {}", payload.getEmail());
        
        try {
            emailService.sendWelcomeEmail(
                payload.getEmail(),
                payload.getUsername(),
                payload.getOtpCode()
            );
            log.info("Successfully sent welcome email to: {}", payload.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", payload.getEmail(), e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.USER_CREATED;
    }
}
