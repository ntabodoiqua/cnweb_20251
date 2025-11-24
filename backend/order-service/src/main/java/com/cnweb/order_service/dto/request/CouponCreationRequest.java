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

    @NotBlank(message = "Coupon code is required")
    @Size(min = 3, max = 50, message = "Coupon code must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Coupon code must contain only uppercase letters, numbers, dash and underscore")
    String code;

    @NotBlank(message = "Coupon name is required")
    @Size(max = 200, message = "Coupon name must not exceed 200 characters")
    String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    String description;

    @NotNull(message = "Discount type is required")
    DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    BigDecimal discountValue;

    @DecimalMin(value = "0.0", message = "Max discount amount must be non-negative")
    BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0.0", message = "Min order amount must be non-negative")
    @Builder.Default
    BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Min(value = 1, message = "Max usage total must be at least 1")
    Integer maxUsageTotal;

    @NotNull(message = "Max usage per user is required")
    @Min(value = 1, message = "Max usage per user must be at least 1")
    @Builder.Default
    Integer maxUsagePerUser = 1;

    String storeId;

    @Builder.Default
    boolean isStoreSpecific = false;

    String applicableProductIds; // JSON array string
    String applicableCategoryIds; // JSON array string

    @NotNull(message = "Valid from date is required")
    LocalDateTime validFrom;

    @NotNull(message = "Valid to date is required")
    LocalDateTime validTo;
}
