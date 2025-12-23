package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.ContentType;
import lombok.*;

/**
 * Embedded document đại diện cho nội dung của một tin nhắn.
 * Hỗ trợ nhiều loại nội dung: text, image, product, order, file.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageContent {

    /**
     * Loại nội dung.
     */
    private ContentType contentType;

    /**
     * Nội dung văn bản (cho TEXT).
     */
    private String text;

    /**
     * Thông tin hình ảnh (cho IMAGE).
     */
    private ImageContent image;

    /**
     * Thông tin sản phẩm (cho PRODUCT).
     */
    private ProductContent product;

    /**
     * Thông tin đơn hàng (cho ORDER).
     */
    private OrderContent order;

    /**
     * Thông tin file đính kèm (cho FILE).
     */
    private FileContent file;

    /**
     * Thông tin sticker (cho STICKER).
     */
    private StickerContent sticker;
}
