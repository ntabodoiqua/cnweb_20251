package com.cnweb.order_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * ApplyCouponRequest - DTO cho việc áp dụng mã giảm giá
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApplyCouponRequest {

    @NotBlank(message = "COUPON_CODE_REQUIRED")
    String couponCode;
}
