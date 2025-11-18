package com.cnweb.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * CouponUsage Entity - Lịch sử sử dụng mã giảm giá
 * Theo dõi việc user đã sử dụng coupon nào, bao nhiêu lần
 */
@Entity
@Table(name = "coupon_usages", indexes = {
    @Index(name = "idx_coupon_usage_user", columnList = "user_id, coupon_id"),
    @Index(name = "idx_coupon_usage_order", columnList = "order_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "coupon_id", nullable = false)
    String couponId;

    @Column(name = "coupon_code", nullable = false, length = 50)
    String couponCode;

    @Column(name = "order_id", nullable = false)
    String orderId;

    @CreationTimestamp
    @Column(name = "used_at", nullable = false, updatable = false)
    LocalDateTime usedAt;
}
