package com.cnweb20251.message_service.dto.response;

import com.cnweb20251.message_service.enums.ConversationStatus;
import lombok.*;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

/**
 * Response DTO cho conversation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {

    private String id;
    private Set<String> participantIds;
    private Set<ParticipantResponse> participants;
    private LastMessageResponse lastMessage;
    private Map<String, Integer> unreadCount;
    private ConversationStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * DTO cho người tham gia.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantResponse {
        private String userId;
        private String displayName;
        private String avatarUrl;
        private String type;
        private String shopId;
        private String shopName;
        private boolean online;
    }

    /**
     * DTO cho tin nhắn cuối cùng.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastMessageResponse {
        private String messageId;
        private String senderId;
        private String senderName;
        private String preview;
        private String type;
        private Instant sentAt;
    }
}
