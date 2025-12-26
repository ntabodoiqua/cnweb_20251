package com.cnweb.order_service.dto.request;

import com.cnweb.order_service.enums.DiscountType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * CouponUpdateRequest - DTO cho việc cập nhật mã giảm giá
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponUpdateRequest {

    String name;
    String description;
    DiscountType discountType;
    BigDecimal discountValue;
    BigDecimal maxDiscountAmount;
    BigDecimal minOrderAmount;
    Integer maxUsageTotal;
    Integer maxUsagePerUser;
    String applicableProductIds;
    String applicableCategoryIds;
    LocalDateTime validFrom;
    LocalDateTime validTo;
    Boolean isActive;
}