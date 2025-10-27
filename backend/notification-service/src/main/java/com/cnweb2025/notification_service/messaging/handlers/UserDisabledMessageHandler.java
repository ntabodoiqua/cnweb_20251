package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserDisabledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class UserDisabledMessageHandler implements MessageHandler<UserDisabledEvent> {
    private final EmailService emailService;
    @Override
    public void handle(UserDisabledEvent payload) {
        log.info("Handling USER_DISABLED event for user: {}", payload.getEmail());
        try {
            emailService.sendUserDisableEmail(
                    payload.getEmail(),
                    payload.getUsername()
            );
            log.info("Successfully sent user disable email to: {}", payload.getEmail());
        } catch (Exception e) {
            log.error("Failed to send user disable email to: {}", payload.getEmail(), e);
            throw new RuntimeException("Failed to send user disable email", e);
        }

        log.info("User disable notification processed for: {}", payload.getEmail());
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.USER_DISABLED;
    }
}