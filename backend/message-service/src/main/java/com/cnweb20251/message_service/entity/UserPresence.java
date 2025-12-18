package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.PresenceStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

/**
 * Entity lưu trữ trạng thái online/offline của người dùng.
 * Dùng để hiển thị trạng thái "đang hoạt động" trong chat.
 */
@Document(collection = "user_presences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPresence implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    /**
     * ID của người dùng.
     */
    @Indexed(unique = true)
    private String userId;

    /**
     * Trạng thái online.
     */
    private PresenceStatus status;

    /**
     * Session ID của WebSocket connection.
     */
    private String sessionId;

    /**
     * Thời gian hoạt động cuối cùng.
     */
    @Indexed
    private Instant lastSeen;

    /**
     * Thời gian hoạt động cuối cùng (alias).
     */
    private Instant lastSeenAt;

    /**
     * Đang gõ tin nhắn trong conversation nào (nếu có).
     */
    private String typingInConversationId;

    /**
     * Thời gian bắt đầu gõ.
     */
    private Instant typingStartedAt;
}
