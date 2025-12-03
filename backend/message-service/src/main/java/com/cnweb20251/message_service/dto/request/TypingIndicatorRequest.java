package com.cnweb20251.message_service.dto.request;

import lombok.*;

/**
 * Request DTO để cập nhật trạng thái đang gõ (typing indicator).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicatorRequest {

    /**
     * ID của conversation.
     */
    private String conversationId;

    /**
     * Trạng thái đang gõ.
     */
    private boolean typing;
}
