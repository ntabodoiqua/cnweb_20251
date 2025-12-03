package com.cnweb20251.message_service.entity;

import lombok.*;

import java.math.BigDecimal;

/**
 * Embedded document chứa thông tin một sản phẩm trong đơn hàng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    /**
     * ID của sản phẩm.
     */
    private String productId;

    /**
     * Tên sản phẩm.
     */
    private String productName;

    /**
     * URL hình ảnh sản phẩm.
     */
    private String imageUrl;

    /**
     * Số lượng.
     */
    private Integer quantity;

    /**
     * Giá mỗi sản phẩm.
     */
    private BigDecimal unitPrice;

    /**
     * Tổng giá (quantity * unitPrice).
     */
    private BigDecimal totalPrice;

    /**
     * Thông tin variant (nếu có).
     */
    private String variantName;

    /**
     * SKU của sản phẩm/variant.
     */
    private String sku;
}
