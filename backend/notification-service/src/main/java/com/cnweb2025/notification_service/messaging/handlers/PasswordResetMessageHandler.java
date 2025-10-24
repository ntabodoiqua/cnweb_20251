package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserForgotPasswordEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message reset password
 * Gửi email với link hoặc OTP reset password
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordResetMessageHandler implements MessageHandler<UserForgotPasswordEvent> {
    
    private final EmailService emailService;
    
    @Override
    public void handle(UserForgotPasswordEvent payload) {
        log.info("Handling PASSWORD_RESET event for user: {}", payload.getEmail());
        
        try {
            emailService.sendPasswordResetEmail(
                payload.getEmail(),
                payload.getUsername(),
                payload.getOtpCode()
            );
            log.info("Successfully sent password reset email to: {}", payload.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", payload.getEmail(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.PASSWORD_RESET;
    }
}
