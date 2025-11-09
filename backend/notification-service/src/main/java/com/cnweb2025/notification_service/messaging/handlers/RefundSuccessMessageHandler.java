package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.cnweb2025.notification_service.service.EmailService;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.RefundSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message khi hoàn tiền thành công
 * Gửi email thông báo cho người dùng
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RefundSuccessMessageHandler implements MessageHandler<RefundSuccessEvent> {
    
    private final EmailService emailService;
    
    @Override
    public void handle(RefundSuccessEvent payload) {
        log.info("Handling REFUND_SUCCESS event for refund: {}", payload.getMRefundId());
        
        try {
            emailService.sendRefundSuccessEmail(
                payload.getEmail(),
                payload.getTitle(),
                payload.getMRefundId(),
                payload.getZpTransId(),
                payload.getAmount(),
                payload.getRefundFeeAmount(),
                payload.getRefundReason(),
                payload.getRefundedAt()
            );
            log.info("Successfully sent refund success email to: {} for refund: {}", 
                    payload.getEmail(), payload.getMRefundId());
        } catch (Exception e) {
            log.error("Failed to send refund success email to: {} for refund: {}", 
                    payload.getEmail(), payload.getMRefundId(), e);
            throw new RuntimeException("Failed to send refund success email", e);
        }
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.REFUND_SUCCESS;
    }
}
