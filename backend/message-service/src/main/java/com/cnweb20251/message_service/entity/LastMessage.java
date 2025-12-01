package com.cnweb20251.message_service.entity;

import lombok.*;

import java.time.Instant;

/**
 * Embedded document chứa thông tin tin nhắn cuối cùng trong đoạn hội thoại.
 * Dùng để hiển thị preview mà không cần query thêm collection messages.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastMessage {

    /**
     * ID của tin nhắn cuối cùng.
     */
    private String messageId;

    /**
     * ID người gửi.
     */
    private String senderId;

    /**
     * Nội dung preview (rút gọn).
     */
    private String preview;

    /**
     * Loại tin nhắn.
     */
    private MessageType type;

    /**
     * Thời gian gửi.
     */
    private Instant sentAt;
}
