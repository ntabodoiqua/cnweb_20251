package com.cnweb20251.message_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request DTO để tạo conversation mới giữa người mua và shop.
 * Chỉ hỗ trợ chat giữa USER (người mua) và SELLER (shop).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    /**
     * ID của shop (store) mà người mua muốn chat.
     * Bắt buộc - conversation luôn được tạo dựa trên shop.
     */
    @NotBlank(message = "Shop ID is required")
    private String shopId;

    /**
     * Tin nhắn đầu tiên (tùy chọn).
     * Nếu có, sẽ được gửi ngay sau khi tạo conversation.
     */
    private String initialMessage;
}
