package com.cnweb20251.message_service.dto.request;

import lombok.*;

import java.util.List;

/**
 * Request DTO để đánh dấu tin nhắn đã đọc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkAsReadRequest {

    /**
     * ID của conversation.
     */
    private String conversationId;

    /**
     * Danh sách ID tin nhắn cần đánh dấu đã đọc.
     * Nếu null hoặc rỗng, đánh dấu tất cả tin nhắn chưa đọc.
     */
    private List<String> messageIds;
}
