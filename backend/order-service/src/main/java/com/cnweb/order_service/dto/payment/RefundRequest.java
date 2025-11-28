package com.cnweb.order_service.dto.payment;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO cho hoàn tiền qua Payment Service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefundRequest {

    /**
     * Mã giao dịch Zalopay muốn hoàn tiền (zp_trans_id)
     */
    String zpTransId;

    /**
     * Số tiền cần hoàn tiền
     */
    Long amount;

    /**
     * Lý do hoàn tiền
     */
    String description;
}
