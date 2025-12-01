package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.ConversationStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity đại diện cho một đoạn hội thoại 1-1 giữa 2 người dùng.
 * Có thể là giữa user-user hoặc user-seller.
 */
@Document(collection = "conversations")
@CompoundIndex(name = "participants_idx", def = "{'participantIds': 1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    private String id;

    /**
     * Danh sách ID của 2 người tham gia cuộc hội thoại.
     * Sử dụng Set để đảm bảo không trùng lặp.
     */
    @Indexed
    private Set<String> participantIds = new HashSet<>();

    /**
     * Thông tin chi tiết của các người tham gia.
     */
    private Set<Participant> participants = new HashSet<>();

    /**
     * Tin nhắn cuối cùng trong đoạn hội thoại (để hiển thị preview).
     */
    private LastMessage lastMessage;

    /**
     * Số tin nhắn chưa đọc cho mỗi người tham gia.
     * Key: userId, Value: số tin nhắn chưa đọc
     */
    private java.util.Map<String, Integer> unreadCount = new java.util.HashMap<>();

    /**
     * Trạng thái của đoạn hội thoại.
     */
    @Builder.Default
    private ConversationStatus status = ConversationStatus.ACTIVE;

    /**
     * Thời gian tạo đoạn hội thoại.
     */
    @Indexed
    private Instant createdAt;

    /**
     * Thời gian cập nhật cuối cùng (thường là khi có tin nhắn mới).
     */
    @Indexed
    private Instant updatedAt;
}
