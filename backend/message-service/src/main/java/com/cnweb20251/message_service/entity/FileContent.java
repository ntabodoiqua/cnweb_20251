package com.cnweb20251.message_service.entity;

import lombok.*;

/**
 * Embedded document chứa thông tin file đính kèm trong tin nhắn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileContent {

    /**
     * ID của file từ file-service.
     */
    private String fileId;

    /**
     * URL download file.
     */
    private String url;

    /**
     * Tên file gốc.
     */
    private String fileName;

    /**
     * Kích thước file (bytes).
     */
    private Long fileSize;

    /**
     * Loại MIME của file.
     */
    private String mimeType;

    /**
     * Phần mở rộng của file.
     */
    private String extension;

    /**
     * URL preview/thumbnail (nếu có, ví dụ cho PDF).
     */
    private String previewUrl;
}
