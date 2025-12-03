package com.cnweb20251.message_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Entity lưu trữ thông tin đã đọc tin nhắn chi tiết.
 * Dùng để tracking chính xác ai đã đọc tin nhắn nào và khi nào.
 */
@Document(collection = "message_read_receipts")
@CompoundIndex(name = "conversation_user_idx", def = "{'conversationId': 1, 'userId': 1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadReceipt {

    @Id
    private String id;

    /**
     * ID của đoạn hội thoại.
     */
    private String conversationId;

    /**
     * ID người dùng đã đọc.
     */
    private String userId;

    /**
     * ID tin nhắn cuối cùng đã đọc trong conversation.
     */
    private String lastReadMessageId;

    /**
     * Thời gian đọc.
     */
    private Instant readAt;
}
