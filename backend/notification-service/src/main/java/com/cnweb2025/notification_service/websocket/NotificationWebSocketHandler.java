package com.cnweb2025.notification_service.websocket;

import com.cnweb2025.notification_service.dto.WebSocketMessage;
import com.cnweb2025.notification_service.service.WebSocketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final WebSocketService webSocketService;
    private final ObjectMapper objectMapper;

    private static final String USER_ID_ATTRIBUTE = "userId";

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserIdFromSession(session);

        if (userId == null || userId.isEmpty()) {
            log.warn("Connection rejected: No userId provided");
            session.close(CloseStatus.BAD_DATA.withReason("userId is required"));
            return;
        }

        // Lưu userId vào session attributes
        session.getAttributes().put(USER_ID_ATTRIBUTE, userId);

        // Đăng ký session
        webSocketService.registerSession(userId, session);

        // Gửi message xác nhận kết nối thành công
        WebSocketMessage connectedMessage = WebSocketMessage.connected();
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(connectedMessage)));

        log.info("WebSocket connection established for user: {}", userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = (String) session.getAttributes().get(USER_ID_ATTRIBUTE);
        String payload = message.getPayload();

        log.debug("Received message from user {}: {}", userId, payload);

        // Xử lý các loại message từ client nếu cần (ví dụ: ping/pong, mark as read, etc.)
        try {
            Map<String, Object> messageData = objectMapper.readValue(payload, Map.class);
            String type = (String) messageData.get("type");

            if ("PING".equals(type)) {
                // Trả lời PONG
                WebSocketMessage pongMessage = WebSocketMessage.builder()
                        .type("PONG")
                        .payload("pong")
                        .timestamp(System.currentTimeMillis())
                        .build();
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(pongMessage)));
            }
        } catch (Exception e) {
            log.warn("Failed to parse message from user {}: {}", userId, payload);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get(USER_ID_ATTRIBUTE);

        if (userId != null) {
            webSocketService.unregisterSession(userId, session);
            log.info("WebSocket connection closed for user: {}, status: {}", userId, status);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String userId = (String) session.getAttributes().get(USER_ID_ATTRIBUTE);
        log.error("WebSocket transport error for user {}: {}", userId, exception.getMessage());

        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    /**
     * Extract userId từ query parameter hoặc JWT token
     */
    private String extractUserIdFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;

        String query = uri.getQuery();
        if (query == null) return null;

        // Parse query parameters
        String[] params = query.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2 && "userId".equals(keyValue[0])) {
                return keyValue[1];
            }
        }

        return null;
    }
}