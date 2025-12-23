package com.cnweb.order_service.dto.payment;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Response DTO cho hoàn tiền từ Payment Service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefundResponse {

    /**
     * Mã giao dịch hoàn tiền của Merchant
     */
    String mRefundId;

    /**
     * Mã giao dịch Zalopay đã hoàn tiền
     */
    String zpTransId;

    /**
     * Mã giao dịch hoàn tiền từ ZaloPay
     */
    Long refundId;

    /**
     * Số tiền hoàn
     */
    Long amount;

    /**
     * Trạng thái: SUCCESS, PROCESSING, FAILED
     */
    String status;

    /**
     * Thông báo
     */
    String message;

    /**
     * Mã lỗi (nếu có)
     */
    Integer errorCode;
}