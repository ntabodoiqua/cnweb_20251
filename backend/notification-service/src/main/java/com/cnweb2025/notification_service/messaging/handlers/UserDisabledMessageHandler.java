package com.cnweb2025.notification_service.messaging.handlers;

import com.cnweb2025.notification_service.messaging.MessageHandler;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserDisabledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class UserDisabledMessageHandler implements MessageHandler<UserDisabledEvent> {

    @Override
    public void handle(UserDisabledEvent payload) {
        log.info("Handling USER_DISABLED event for user: {}", payload.getEmail());

        // TODO: Gửi email thông báo tài khoản bị vô hiệu hóa

        log.info("User disable notification processed for: {}", payload.getEmail());
    }

    @Override
    public boolean supports(MessageType messageType) {
        return messageType == MessageType.USER_DISABLED;
    }
}