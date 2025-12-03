package com.cnweb20251.message_service.service;

import com.cnweb20251.message_service.entity.UserPresence;
import com.cnweb20251.message_service.enums.PresenceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service quản lý trạng thái online/offline của users.
 * Sử dụng Redis để lưu trữ trạng thái có khả năng mở rộng.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String PRESENCE_KEY_PREFIX = "presence:user:";
    private static final Duration PRESENCE_TTL = Duration.ofHours(24);

    // In-memory fallback nếu Redis không khả dụng
    private final ConcurrentHashMap<String, UserPresence> localPresenceCache = new ConcurrentHashMap<>();

    /**
     * Cập nhật trạng thái presence của user.
     */
    public void updatePresence(String userId, PresenceStatus status, String sessionId) {
        UserPresence presence = UserPresence.builder()
                .userId(userId)
                .status(status)
                .sessionId(sessionId)
                .lastSeen(Instant.now())
                .build();

        try {
            // Lưu vào Redis
            String key = PRESENCE_KEY_PREFIX + userId;
            redisTemplate.opsForValue().set(key, presence, PRESENCE_TTL);
            log.debug("Updated presence in Redis for user: {} - status: {}", userId, status);
        } catch (Exception e) {
            log.warn("Failed to update presence in Redis, using local cache: {}", e.getMessage());
            localPresenceCache.put(userId, presence);
        }

        // Broadcast sự thay đổi trạng thái đến các users liên quan
        broadcastPresenceChange(userId, status);
    }

    /**
     * Lấy trạng thái presence của user.
     */
    public UserPresence getPresence(String userId) {
        try {
            String key = PRESENCE_KEY_PREFIX + userId;
            Object result = redisTemplate.opsForValue().get(key);
            if (result instanceof UserPresence) {
                return (UserPresence) result;
            }
        } catch (Exception e) {
            log.warn("Failed to get presence from Redis: {}", e.getMessage());
        }

        // Fallback to local cache
        return localPresenceCache.get(userId);
    }

    /**
     * Kiểm tra user có đang online không.
     */
    public boolean isUserOnline(String userId) {
        UserPresence presence = getPresence(userId);
        return presence != null && presence.getStatus() == PresenceStatus.ONLINE;
    }

    /**
     * Lấy trạng thái presence của nhiều users.
     */
    public Map<String, PresenceStatus> getPresenceForUsers(Set<String> userIds) {
        Map<String, PresenceStatus> presenceMap = new HashMap<>();

        for (String userId : userIds) {
            UserPresence presence = getPresence(userId);
            presenceMap.put(userId, presence != null ? presence.getStatus() : PresenceStatus.OFFLINE);
        }

        return presenceMap;
    }

    /**
     * Broadcast thay đổi trạng thái đến các users liên quan.
     */
    private void broadcastPresenceChange(String userId, PresenceStatus status) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("status", status.name());
        payload.put("timestamp", Instant.now().toString());

        // Gửi đến topic chung cho presence updates
        messagingTemplate.convertAndSend("/topic/presence", payload);
        
        log.debug("Broadcasted presence change for user: {} - status: {}", userId, status);
    }
}
