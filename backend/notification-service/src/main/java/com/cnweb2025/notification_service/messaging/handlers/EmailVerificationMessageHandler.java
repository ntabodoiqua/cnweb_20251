package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message verification email
 * Gửi email với OTP để verify email
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationMessageHandler implements MessageHandler<UserCreatedEvent> {
    
    private final EmailService emailService;
    
    @Override
    public void handle(UserCreatedEvent payload) {
        log.info("Handling EMAIL_VERIFICATION event for user: {}", payload.getEmail());
        
        try {
            emailService.sendVerificationEmail(
                payload.getEmail(),
                payload.getUsername(),
                payload.getOtpCode()
            );
            log.info("Successfully sent verification email to: {}", payload.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", payload.getEmail(), e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.EMAIL_VERIFICATION;
    }
}
