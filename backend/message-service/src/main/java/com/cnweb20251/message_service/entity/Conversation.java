package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.ConversationStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity đại diện cho một đoạn hội thoại 1-1 giữa người mua (buyer) và shop (seller).
 * Mỗi conversation luôn có đúng 1 buyer và 1 shop.
 * Sử dụng username làm định danh cho buyer và shop owner.
 */
@Document(collection = "conversations")
@CompoundIndexes({
    @CompoundIndex(name = "participants_idx", def = "{'participantIds': 1}"),
    @CompoundIndex(name = "shop_buyer_idx", def = "{'shopId': 1, 'buyerUsername': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    private String id;

    /**
     * ID của shop (store) trong conversation.
     * Bắt buộc - mỗi conversation phải liên kết với một shop.
     */
    @Indexed
    private String shopId;

    /**
     * Username của chủ shop (người bán) trong conversation.
     * Dùng để gửi WebSocket message đến đúng user.
     */
    @Indexed
    private String shopOwnerUsername;

    /**
     * Username của buyer (người mua) trong conversation.
     * Bắt buộc - mỗi conversation phải có một buyer.
     */
    @Indexed
    private String buyerUsername;

    /**
     * Danh sách username của 2 người tham gia cuộc hội thoại.
     * Bao gồm: buyerUsername và shopOwnerUsername.
     */
    @Indexed
    @Builder.Default
    private Set<String> participantIds = new HashSet<>();

    /**
     * Thông tin chi tiết của các người tham gia.
     */
    @Builder.Default
    private Set<Participant> participants = new HashSet<>();

    /**
     * Tin nhắn cuối cùng trong đoạn hội thoại (để hiển thị preview).
     */
    private LastMessage lastMessage;

    /**
     * Số tin nhắn chưa đọc cho mỗi người tham gia.
     * Key: username (buyerUsername hoặc shopOwnerUsername), Value: số tin nhắn chưa đọc
     */
    @Builder.Default
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
