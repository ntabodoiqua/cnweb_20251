package com.cnweb2025.notification_service.service;

import com.cnweb2025.notification_service.dto.NotificationDTO;
import com.cnweb2025.notification_service.dto.WebSocketMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    // Map userId -> Set<WebSocketSession> (một user có thể có nhiều session, ví dụ mở nhiều tab)
    private final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper;

    /**
     * Đăng ký session cho user
     */
    public void registerSession(String userId, WebSocketSession session) {
        userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
        log.info("Registered WebSocket session for user: {}, total sessions: {}",
                userId, userSessions.get(userId).size());
    }

    /**
     * Hủy đăng ký session
     */
    public void unregisterSession(String userId, WebSocketSession session) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
            log.info("Unregistered WebSocket session for user: {}", userId);
        }
    }

    /**
     * Gửi thông báo đến user cụ thể
     */
    public void sendNotificationToUser(String userId, NotificationDTO notification) {
        WebSocketMessage message = WebSocketMessage.notification(notification);
        sendMessageToUser(userId, message);
    }

    /**
     * Gửi cập nhật số lượng thông báo chưa đọc
     */
    public void sendUnreadCountToUser(String userId, long count) {
        WebSocketMessage message = WebSocketMessage.unreadCount(count);
        sendMessageToUser(userId, message);
    }

    /**
     * Gửi message đến user
     */
    public void sendMessageToUser(String userId, WebSocketMessage message) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            log.debug("No active WebSocket sessions for user: {}", userId);
            return;
        }

        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(jsonMessage);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        synchronized (session) {
                            session.sendMessage(textMessage);
                        }
                        log.debug("Sent message to user: {}, type: {}", userId, message.getType());
                    } catch (IOException e) {
                        log.error("Failed to send message to session: {}", session.getId(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize message for user: {}", userId, e);
        }
    }

    /**
     * Gửi message đến tất cả users (broadcast)
     */
    public void broadcastMessage(WebSocketMessage message) {
        for (String userId : userSessions.keySet()) {
            sendMessageToUser(userId, message);
        }
    }

    /**
     * Kiểm tra user có đang online không
     */
    public boolean isUserOnline(String userId) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    /**
     * Lấy số lượng users đang online
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }
}