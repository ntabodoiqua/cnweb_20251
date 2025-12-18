package com.cnweb20251.message_service.controller;

import com.cnweb20251.message_service.dto.request.MarkAsReadRequest;
import com.cnweb20251.message_service.dto.request.SendMessageRequest;
import com.cnweb20251.message_service.dto.request.TypingIndicatorRequest;
import com.cnweb20251.message_service.dto.response.MessageResponse;
import com.cnweb20251.message_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket Controller xử lý các tin nhắn chat realtime qua STOMP.
 * 
 * Endpoints:
 * - /app/chat.send - Gửi tin nhắn mới
 * - /app/chat.typing - Gửi typing indicator
 * - /app/chat.read - Đánh dấu tin nhắn đã đọc
 * 
 * Subscribe channels:
 * - /user/queue/messages - Nhận tin nhắn mới
 * - /user/queue/typing - Nhận typing indicator
 * - /user/queue/read-receipts - Nhận thông báo đã đọc
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;

    /**
     * Xử lý gửi tin nhắn mới.
     * Client gửi đến: /app/chat.send
     * Server gửi đến tất cả participants: /user/{userId}/queue/messages
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("Received message from unauthenticated user");
            return;
        }
        
        String userId = principal.getName();
        log.info("Received message from user: {} to conversation: {}", userId, request.getConversationId());
        
        try {
            MessageResponse response = chatService.sendMessage(userId, request);
            log.info("Message sent successfully: {}", response.getId());
        } catch (Exception e) {
            log.error("Failed to send message: ", e);
        }
    }

    /**
     * Xử lý typing indicator.
     * Client gửi đến: /app/chat.typing
     * Server gửi đến participants khác: /user/{userId}/queue/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorRequest request, Principal principal) {
        if (principal == null) {
            return;
        }
        
        String userId = principal.getName();
        chatService.sendTypingIndicator(request.getConversationId(), userId, request.isTyping());
    }

    /**
     * Xử lý đánh dấu tin nhắn đã đọc.
     * Client gửi đến: /app/chat.read
     * Server gửi đến sender: /user/{senderId}/queue/read-receipts
     */
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload MarkAsReadRequest request, Principal principal) {
        if (principal == null) {
            return;
        }
        
        String userId = principal.getName();
        log.info("Mark as read request from user: {} for conversation: {}", userId, request.getConversationId());
        
        try {
            chatService.markMessagesAsRead(request.getConversationId(), userId, request.getMessageIds());
        } catch (Exception e) {
            log.error("Failed to mark messages as read: ", e);
        }
    }
}
