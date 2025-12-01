package com.cnweb20251.message_service.event;

import com.cnweb20251.message_service.enums.PresenceStatus;
import com.cnweb20251.message_service.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;

/**
 * Event listener cho các sự kiện WebSocket.
 * Theo dõi kết nối, ngắt kết nối và subscribe của users.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final PresenceService presenceService;

    /**
     * Xử lý khi user kết nối WebSocket.
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null) {
            String userId = principal.getName();
            String sessionId = headerAccessor.getSessionId();
            
            log.info("User connected: {} with session: {}", userId, sessionId);
            
            // Cập nhật trạng thái online
            presenceService.updatePresence(userId, PresenceStatus.ONLINE, sessionId);
        }
    }

    /**
     * Xử lý khi user ngắt kết nối WebSocket.
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null) {
            String userId = principal.getName();
            String sessionId = headerAccessor.getSessionId();
            
            log.info("User disconnected: {} with session: {}", userId, sessionId);
            
            // Cập nhật trạng thái offline
            presenceService.updatePresence(userId, PresenceStatus.OFFLINE, sessionId);
        }
    }

    /**
     * Xử lý khi user subscribe một channel.
     */
    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        String destination = headerAccessor.getDestination();
        
        if (principal != null && destination != null) {
            log.debug("User {} subscribed to: {}", principal.getName(), destination);
        }
    }
}
