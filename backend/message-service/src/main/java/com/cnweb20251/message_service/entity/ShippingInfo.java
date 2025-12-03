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
     * Tên người nhận.
     */
    private String recipientName;

    /**
     * Số điện thoại người nhận.
     */
    private String recipientPhone;

    /**
     * Địa chỉ giao hàng.
     */
    private String address;

    /**
     * Địa chỉ giao hàng (rút gọn - deprecated, sử dụng address).
     */
    @Deprecated
    private String deliveryAddress;
}
