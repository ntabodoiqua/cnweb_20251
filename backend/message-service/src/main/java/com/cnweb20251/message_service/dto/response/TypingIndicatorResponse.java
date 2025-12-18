package com.cnweb20251.message_service.dto.response;

import lombok.*;

/**
 * Response DTO cho thông báo typing indicator.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicatorResponse {

    private String conversationId;
    private String userId;
    private String userName;
    private boolean typing;
}
