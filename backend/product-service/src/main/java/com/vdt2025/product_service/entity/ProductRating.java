package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "product_ratings")
public class ProductRating {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId; // ID của user đánh giá (từ user-service)

    @Column(name = "order_id")
    String orderId; // ID đơn hàng (để verify user đã mua hàng)

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(nullable = false)
    Integer rating; // Điểm đánh giá từ 1-5 sao

    @Column(columnDefinition = "TEXT")
    String comment; // Nội dung review

    @Column(name = "is_verified_purchase", nullable = false)
    @Builder.Default
    boolean isVerifiedPurchase = false; // Đã mua hàng chưa

    @Column(name = "helpful_count")
    @Builder.Default
    Integer helpfulCount = 0; // Số người thấy review hữu ích

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    // Relationship với Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    // Có thể thêm relationship với ProductVariant nếu muốn đánh giá cụ thể variant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    ProductVariant variant;
}
