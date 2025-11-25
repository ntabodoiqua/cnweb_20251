package com.cnweb.order_service.dto.request;

import com.cnweb.order_service.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * CouponCreationRequest - DTO cho việc tạo mã giảm giá
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponCreationRequest {

    @NotBlank(message = "COUPON_CODE_REQUIRED")
    @Size(min = 3, max = 50, message = "COUPON_CODE_LENGTH")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "COUPON_CODE_FORMAT")
    String code;

    @NotBlank(message = "COUPON_NAME_REQUIRED")
    @Size(max = 200, message = "COUPON_NAME_LENGTH")
    String name;

    @Size(max = 2000, message = "DESCRIPTION_LENGTH")
    String description;

    @NotNull(message = "DISCOUNT_TYPE_REQUIRED")
    DiscountType discountType;

    @NotNull(message = "DISCOUNT_VALUE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "DISCOUNT_VALUE_POSITIVE")
    BigDecimal discountValue;

    @DecimalMin(value = "0.0", message = "MAX_DISCOUNT_AMOUNT_NON_NEGATIVE")
    BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0.0", message = "MIN_ORDER_AMOUNT_NON_NEGATIVE")
    @Builder.Default
    BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Min(value = 1, message = "MAX_USAGE_TOTAL_AT_LEAST_1")
    Integer maxUsageTotal;

    @NotNull(message = "MAX_USAGE_PER_USER_REQUIRED")
    @Min(value = 1, message = "MAX_USAGE_PER_USER_AT_LEAST_1")
    @Builder.Default
    Integer maxUsagePerUser = 1;


    // If null or empty, means applicable to all stores
    String storeId;

    @Builder.Default
    boolean isStoreSpecific = false;

    String applicableProductIds; // JSON array string
    String applicableCategoryIds; // JSON array string

    @NotNull(message = "VALID_FROM_DATE_REQUIRED")
    LocalDateTime validFrom;

    @NotNull(message = "VALID_TO_DATE_REQUIRED")
    LocalDateTime validTo;
}
