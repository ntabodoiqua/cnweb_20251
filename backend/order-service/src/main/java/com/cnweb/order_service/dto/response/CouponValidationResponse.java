package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * CouponValidationResponse - DTO cho kết quả validate coupon
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponValidationResponse {

    boolean valid;
    String message;
    String couponId;
    String couponCode;
    BigDecimal discountAmount;
    BigDecimal shippingFeeDiscount;
    BigDecimal finalAmount;
}
