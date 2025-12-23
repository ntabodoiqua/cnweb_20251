package com.cnweb20251.message_service.entity;

import lombok.*;

/**
 * Embedded document chứa thông tin sticker/emoji trong tin nhắn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StickerContent {

    /**
     * ID của sticker pack.
     */
    private String packId;

    /**
     * ID của sticker.
     */
    private String stickerId;

    /**
     * URL của sticker.
     */
    private String url;

    /**
     * Alt text cho sticker.
     */
    private String alt;

    /**
     * Chiều rộng hiển thị.
     */
    private Integer width;

    /**
     * Chiều cao hiển thị.
     */
    private Integer height;
}
