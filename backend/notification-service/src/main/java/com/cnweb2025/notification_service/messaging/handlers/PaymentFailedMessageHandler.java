package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message khi thanh toán thất bại
 * Gửi email thông báo cho người dùng
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentFailedMessageHandler implements MessageHandler<PaymentFailedEvent> {
    
    private final EmailService emailService;
    
    @Override
    public void handle(PaymentFailedEvent payload) {
        log.info("Handling PAYMENT_FAILED event for transaction: {}", payload.getAppTransId());
        
        try {
            emailService.sendPaymentFailedEmail(
                payload.getEmail(),
                payload.getTitle(),
                payload.getDescription(),
                payload.getAppTransId(),
                payload.getAmount(),
                payload.getFailureReason(),
                payload.getFailedAt()
            );
            log.info("Successfully sent payment failed email to: {} for transaction: {}", 
                    payload.getEmail(), payload.getAppTransId());
        } catch (Exception e) {
            log.error("Failed to send payment failed email to: {} for transaction: {}", 
                    payload.getEmail(), payload.getAppTransId(), e);
            throw new RuntimeException("Failed to send payment failed email", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.PAYMENT_FAILED;
    }
}
