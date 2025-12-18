package com.cnweb.order_service.dto.response;

import com.cnweb.order_service.enums.DiscountType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * CouponResponse - DTO cho coupon response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponResponse {

    String id;
    String code;
    String name;
    String description;
    DiscountType discountType;
    BigDecimal discountValue;
    BigDecimal maxDiscountAmount;
    BigDecimal minOrderAmount;
    Integer maxUsageTotal;
    Integer maxUsagePerUser;
    Integer usedCount;
    String storeId;
    boolean isStoreSpecific;
    String applicableProductIds;
    String applicableCategoryIds;
    LocalDateTime validFrom;
    LocalDateTime validTo;
    boolean isActive;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
