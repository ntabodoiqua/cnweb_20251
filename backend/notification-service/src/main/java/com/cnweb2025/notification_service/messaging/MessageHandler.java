package com.cnweb2025.notification_service.messaging;

/**
 * Interface cho các handler xử lý message
 * @param <T> Kiểu dữ liệu của message payload
 */
public interface MessageHandler<T> {
    /**
     * Xử lý message nhận được
     * @param payload Dữ liệu message
     */
    void handle(T payload);
    
    /**
     * Kiểm tra handler có hỗ trợ kiểu message này không
     * @param messageType Loại message
     * @return true nếu hỗ trợ
     */
    boolean supports(com.vdt2025.common_dto.dto.MessageType messageType);
}
