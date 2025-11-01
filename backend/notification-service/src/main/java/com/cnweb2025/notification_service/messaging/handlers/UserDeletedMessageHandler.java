package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler xử lý message khi user bị xóa
 * Có thể gửi email xác nhận xóa tài khoản hoặc farewell message
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserDeletedMessageHandler implements MessageHandler<UserCreatedEvent> {
    
    // TODO: Implement email service khi cần
    
    @Override
    public void handle(UserCreatedEvent payload) {
        log.info("Handling USER_DELETED event for user: {}", payload.getEmail());
        
        // TODO: Gửi email xác nhận xóa tài khoản
        // Ví dụ: Email farewell hoặc xác nhận việc xóa tài khoản thành công
        
        log.info("User deletion notification processed for: {}", payload.getEmail());
    }
    
    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.USER_DELETED;
    }
}
