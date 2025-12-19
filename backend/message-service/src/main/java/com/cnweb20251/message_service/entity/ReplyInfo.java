package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.MessageType;
import lombok.*;

/**
 * Embedded document chứa thông tin tin nhắn được reply.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyInfo {

    /**
     * ID của tin nhắn được reply.
     */
    private String messageId;

    /**
     * ID người gửi tin nhắn gốc.
     */
    private String senderId;

    /**
     * Tên người gửi tin nhắn gốc.
     */
    private String senderName;

    /**
     * Loại tin nhắn gốc.
     */
    private MessageType type;

    /**
     * Preview nội dung tin nhắn gốc.
     */
    private String preview;

    /**
     * URL hình ảnh nếu tin nhắn gốc là ảnh.
     */
    private String thumbnailUrl;
}
