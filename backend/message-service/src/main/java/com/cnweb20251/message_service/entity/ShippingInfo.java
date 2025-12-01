package com.cnweb20251.message_service.entity;

import lombok.*;

/**
 * Embedded document chứa thông tin vận chuyển của đơn hàng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingInfo {

    /**
     * Đơn vị vận chuyển.
     */
    private String carrier;

    /**
     * Mã vận đơn.
     */
    private String trackingNumber;

    /**
     * URL tracking đơn hàng.
     */
    private String trackingUrl;

    /**
     * Trạng thái vận chuyển.
     */
    private String status;

    /**
     * Địa chỉ giao hàng (rút gọn).
     */
    private String deliveryAddress;
}
