package com.cnweb20251.message_service.entity;

import lombok.*;

import java.math.BigDecimal;

/**
 * Embedded document chứa thông tin variant của sản phẩm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    /**
     * ID của variant.
     */
    private String variantId;

    /**
     * Tên variant (ví dụ: "Đỏ - Size M").
     */
    private String name;

    /**
     * SKU của variant.
     */
    private String sku;

    /**
     * Giá của variant.
     */
    private BigDecimal price;

    /**
     * Giá gốc của variant (trước khi giảm giá).
     */
    private BigDecimal originalPrice;

    /**
     * URL hình ảnh của variant.
     */
    private String imageUrl;

    /**
     * Các thuộc tính của variant (ví dụ: màu sắc, kích thước).
     */
    private java.util.Map<String, String> attributes;

    /**
     * Trạng thái còn hàng.
     */
    private Boolean inStock;

    /**
     * Số lượng tồn kho.
     */
    private Integer stockQuantity;
}
