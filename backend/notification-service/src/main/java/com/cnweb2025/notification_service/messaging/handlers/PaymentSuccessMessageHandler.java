package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.PaymentSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message khi thanh toán thành công
 * Gửi email thông báo cho người dùng
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSuccessMessageHandler implements MessageHandler<PaymentSuccessEvent> {
    
    private final EmailService emailService;
    
    @Override
    public void handle(PaymentSuccessEvent payload) {
        log.info("Handling PAYMENT_SUCCESS event for transaction: {}", payload.getAppTransId());
        
        try {
            emailService.sendPaymentSuccessEmail(
                payload.getEmail(),
                payload.getTitle(),
                payload.getDescription(),
                payload.getAppTransId(),
                payload.getAmount(),
                payload.getPaidAt()
            );
            log.info("Successfully sent payment success email to: {} for transaction: {}", 
                    payload.getEmail(), payload.getAppTransId());
        } catch (Exception e) {
            log.error("Failed to send payment success email to: {} for transaction: {}", 
                    payload.getEmail(), payload.getAppTransId(), e);
            throw new RuntimeException("Failed to send payment success email", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.PAYMENT_SUCCESS;
    }
}
