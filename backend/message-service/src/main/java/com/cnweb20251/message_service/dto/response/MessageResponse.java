package com.cnweb20251.message_service.dto.response;

import com.cnweb20251.message_service.entity.*;
import com.cnweb20251.message_service.enums.MessageStatus;
import com.cnweb20251.message_service.enums.MessageType;
import lombok.*;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO cho tin nhắn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private MessageType type;
    private List<MessageContentResponse> contents;
    private ReplyInfoResponse replyTo;
    private MessageStatus status;
    private List<String> readBy;
    private Instant sentAt;
    private Instant readAt;
    private Instant editedAt;
    private Boolean deleted;

    /**
     * DTO cho nội dung tin nhắn.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageContentResponse {
        private String contentType;
        private String text;
        private ImageContent image;
        private ProductContent product;
        private OrderContent order;
        private FileContent file;
        private StickerContent sticker;
    }

    /**
     * DTO cho thông tin reply.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplyInfoResponse {
        private String messageId;
        private String senderId;
        private String senderName;
        private String type;
        private String preview;
        private String thumbnailUrl;
    }
}
