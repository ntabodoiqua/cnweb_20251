package com.cnweb20251.message_service.entity;

import lombok.*;

/**
 * Embedded document chứa thông tin hình ảnh trong tin nhắn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageContent {

    /**
     * ID của file từ file-service.
     */
    private String fileId;

    /**
     * URL của hình ảnh.
     */
    private String url;

    /**
     * URL thumbnail của hình ảnh.
     */
    private String thumbnailUrl;

    /**
     * Tên file gốc.
     */
    private String fileName;

    /**
     * Kích thước file (bytes).
     */
    private Long fileSize;

    /**
     * Loại MIME của hình ảnh.
     */
    private String mimeType;

    /**
     * Chiều rộng của hình ảnh (pixels).
     */
    private Integer width;

    /**
     * Chiều cao của hình ảnh (pixels).
     */
    private Integer height;

    /**
     * Caption/mô tả cho hình ảnh (nếu có).
     */
    private String caption;
}
