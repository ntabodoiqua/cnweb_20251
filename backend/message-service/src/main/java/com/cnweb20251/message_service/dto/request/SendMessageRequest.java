package com.cnweb20251.message_service.dto.request;

import com.cnweb20251.message_service.enums.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO để gửi tin nhắn mới.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    /**
     * ID của conversation (nếu đã có).
     */
    private String conversationId;

    /**
     * ID người nhận (nếu tạo conversation mới).
     */
    private String recipientId;

    /**
     * Loại nội dung chính của tin nhắn.
     */
    @NotNull(message = "Content type is required")
    private ContentType contentType;

    /**
     * Nội dung văn bản (cho TEXT).
     */
    private String text;

    /**
     * Thông tin hình ảnh (cho IMAGE).
     */
    private ImageContentRequest image;

    /**
     * Thông tin sản phẩm (cho PRODUCT).
     */
    private ProductContentRequest product;

    /**
     * Thông tin đơn hàng (cho ORDER).
     */
    private OrderContentRequest order;

    /**
     * Thông tin file (cho FILE).
     */
    private FileContentRequest file;

    /**
     * ID tin nhắn được reply (nếu có).
     */
    private String replyToMessageId;

    /**
     * DTO cho nội dung hình ảnh.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageContentRequest {
        private String fileId;
        private String url;
        private String thumbnailUrl;
        private String fileName;
        private Long fileSize;
        private String mimeType;
        private Integer width;
        private Integer height;
        private String caption;
    }

    /**
     * DTO cho nội dung sản phẩm.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductContentRequest {
        @NotBlank(message = "Product ID is required")
        private String productId;
        private String note;
    }

    /**
     * DTO cho nội dung đơn hàng.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderContentRequest {
        @NotBlank(message = "Order ID is required")
        private String orderId;
        private String note;
    }

    /**
     * DTO cho nội dung file.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileContentRequest {
        private String fileId;
        private String url;
        private String fileName;
        private Long fileSize;
        private String mimeType;
        private String extension;
        private String previewUrl;
    }
}
