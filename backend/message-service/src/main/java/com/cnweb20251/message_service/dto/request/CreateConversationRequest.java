package com.cnweb20251.message_service.dto.request;

import com.cnweb20251.message_service.enums.ParticipantType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request DTO để tạo conversation mới.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    /**
     * ID người dùng được mời vào conversation.
     */
    @NotBlank(message = "Recipient ID is required")
    private String recipientId;

    /**
     * Loại người nhận (USER hoặc SELLER).
     */
    private ParticipantType recipientType;

    /**
     * ID shop (nếu người nhận là SELLER).
     */
    private String shopId;
}
