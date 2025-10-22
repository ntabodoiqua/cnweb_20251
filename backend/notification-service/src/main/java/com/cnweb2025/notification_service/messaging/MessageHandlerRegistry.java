package com.cnweb2025.notification_service.messaging;

import com.vdt2025.common_dto.dto.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry để quản lý và lấy handler cho từng loại message
 */
@Component
@Slf4j
public class MessageHandlerRegistry {
    
    private final Map<MessageType, MessageHandler<?>> handlers = new ConcurrentHashMap<>();
    
    /**
     * Constructor tự động đăng ký tất cả các handler được inject
     */
    public MessageHandlerRegistry(List<MessageHandler<?>> handlerList) {
        for (MessageHandler<?> handler : handlerList) {
            for (MessageType messageType : MessageType.values()) {
                if (handler.supports(messageType)) {
                    handlers.put(messageType, handler);
                    log.info("Registered handler {} for message type {}", 
                            handler.getClass().getSimpleName(), messageType);
                }
            }
        }
    }
    
    /**
     * Lấy handler cho một message type cụ thể
     */
    public MessageHandler<?> getHandler(MessageType messageType) {
        return handlers.get(messageType);
    }
}
