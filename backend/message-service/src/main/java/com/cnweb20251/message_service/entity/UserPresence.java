package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.PresenceStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
public class UserPresence {

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
     * Thời gian hoạt động cuối cùng.
     */
    @Indexed
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
