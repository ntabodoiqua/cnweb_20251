package com.cnweb.order_service.entity;

import com.cnweb.order_service.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Coupon Entity - Mã giảm giá
 * Hỗ trợ nhiều loại giảm giá và điều kiện áp dụng
 */
@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupon_code", columnList = "code", unique = true),
    @Index(name = "idx_coupon_store_id", columnList = "store_id"),
    @Index(name = "idx_coupon_valid_date", columnList = "valid_from, valid_to"),
    @Index(name = "idx_coupon_is_active", columnList = "is_active")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    String code; // Mã giảm giá (SUMMER2025, FREESHIP, etc.)

    @Column(name = "name", nullable = false, length = 200)
    String name; // Tên mã giảm giá

    @Column(name = "description", columnDefinition = "TEXT")
    String description; // Mô tả chi tiết

    // Loại giảm giá
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    DiscountType discountType; // PERCENTAGE, FIXED_AMOUNT

    // Giá trị giảm giá
    @Column(name = "discount_value", nullable = false, precision = 19, scale = 2)
    BigDecimal discountValue; // Nếu PERCENTAGE thì là %, nếu FIXED_AMOUNT thì là số tiền

    @Column(name = "max_discount_amount", precision = 19, scale = 2)
    BigDecimal maxDiscountAmount; // Giảm tối đa (cho trường hợp PERCENTAGE)

    // Điều kiện áp dụng
    @Column(name = "min_order_amount", precision = 19, scale = 2)
    @Builder.Default
    BigDecimal minOrderAmount = BigDecimal.ZERO; // Giá trị đơn hàng tối thiểu

    @Column(name = "max_usage_total")
    Integer maxUsageTotal; // Tổng số lần sử dụng tối đa (null = không giới hạn)

    @Column(name = "max_usage_per_user")
    @Builder.Default
    Integer maxUsagePerUser = 1; // Số lần sử dụng tối đa mỗi user

    @Column(name = "used_count")
    @Builder.Default
    Integer usedCount = 0; // Số lần đã sử dụng

    // Phạm vi áp dụng
    @Column(name = "store_id")
    String storeId; // null = áp dụng cho tất cả store

    @Column(name = "is_store_specific")
    @Builder.Default
    boolean isStoreSpecific = false; // true = chỉ áp dụng cho 1 store cụ thể

    @Column(name = "applicable_product_ids", columnDefinition = "TEXT")
    String applicableProductIds; // JSON array của product IDs (null = tất cả sản phẩm)

    @Column(name = "applicable_category_ids", columnDefinition = "TEXT")
    String applicableCategoryIds; // JSON array của category IDs

    // Thời gian hiệu lực
    @Column(name = "valid_from", nullable = false)
    LocalDateTime validFrom;

    @Column(name = "valid_to", nullable = false)
    LocalDateTime validTo;

    // Trạng thái
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = true;

    @Column(name = "created_by")
    String createdBy; // User ID của người tạo (admin hoặc seller)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    /**
     * Kiểm tra coupon có hợp lệ không
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive 
            && now.isAfter(validFrom) 
            && now.isBefore(validTo)
            && (maxUsageTotal == null || usedCount < maxUsageTotal);
    }

    /**
     * Kiểm tra user có thể sử dụng coupon không
     */
    public boolean canBeUsedByUser(int userUsageCount) {
        return userUsageCount < maxUsagePerUser;
    }

    /**
     * Kiểm tra đơn hàng có đủ điều kiện không
     */
    public boolean isApplicableForOrder(BigDecimal orderAmount) {
        return orderAmount.compareTo(minOrderAmount) >= 0;
    }

    /**
     * Tính số tiền giảm giá
     */
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        BigDecimal discount = BigDecimal.ZERO;

        switch (discountType) {
            case PERCENTAGE:
                discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
                if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                    discount = maxDiscountAmount;
                }
                break;
            case FIXED_AMOUNT:
                discount = discountValue;
                break;
        }

        return discount;
    }

    /**
     * Tăng số lần sử dụng
     */
    public void incrementUsedCount() {
        this.usedCount++;
    }
}
