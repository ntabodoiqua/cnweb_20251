package com.cnweb20251.message_service.dto.response;

import lombok.*;

/**
 * Response DTO cho thông báo đã đọc tin nhắn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadResponse {

    private String conversationId;
    private String userId;
    private String messageId;
    private java.time.Instant readAt;
}
