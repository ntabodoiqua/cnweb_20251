package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.MessageStatus;
import com.cnweb20251.message_service.enums.MessageType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho một tin nhắn trong đoạn hội thoại.
 */
@Document(collection = "messages")
@CompoundIndex(name = "conversation_time_idx", def = "{'conversationId': 1, 'sentAt': -1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    private String id;

    /**
     * ID của đoạn hội thoại chứa tin nhắn này.
     */
    @Indexed
    private String conversationId;

    /**
     * ID người gửi tin nhắn.
     */
    @Indexed
    private String senderId;

    /**
     * Loại tin nhắn.
     */
    private MessageType type;

    /**
     * Nội dung tin nhắn (có thể có nhiều nội dung trong 1 tin nhắn).
     * Ví dụ: text + hình ảnh, hoặc sản phẩm + text mô tả.
     */
    @Builder.Default
    private List<MessageContent> contents = new ArrayList<>();

    /**
     * Tin nhắn mà tin nhắn này reply (nếu có).
     */
    private ReplyInfo replyTo;

    /**
     * Trạng thái của tin nhắn.
     */
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    /**
     * Danh sách ID người đã đọc tin nhắn.
     */
    @Builder.Default
    private List<String> readBy = new ArrayList<>();

    /**
     * Thời gian gửi tin nhắn.
     */
    @Indexed
    private Instant sentAt;

    /**
     * Thời gian được đọc (lần đầu tiên người nhận đọc).
     */
    private Instant readAt;

    /**
     * Thời gian chỉnh sửa (nếu có).
     */
    private Instant editedAt;

    /**
     * Đánh dấu tin nhắn đã bị xóa (soft delete).
     */
    @Builder.Default
    private Boolean deleted = false;

    /**
     * Thời gian xóa tin nhắn.
     */
    private Instant deletedAt;
}
