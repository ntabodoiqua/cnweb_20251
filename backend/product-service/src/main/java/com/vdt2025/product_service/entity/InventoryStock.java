package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity quản lý tồn kho cho từng ProductVariant
 * Sử dụng cơ chế reserved stock để đảm bảo tính nhất quán khi xử lý đơn hàng
 * 
 * Best Practices:
 * - Validation: Đảm bảo số lượng không âm
 * - Optimistic Locking: Sử dụng @Version để tránh race condition
 * - Indexes: Tối ưu query theo productVariantId
 * - Audit: Tracking thời gian tạo/cập nhật
 * - Business Logic: Các helper methods để check available stock
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(
    name = "inventory_stocks",
    indexes = {
        @Index(name = "idx_inventory_product_variant", columnList = "product_variant_id"),
        @Index(name = "idx_inventory_available", columnList = "quantity_on_hand, quantity_reserved")
    }
)
public class InventoryStock {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @OneToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "product_variant_id", nullable = false, unique = true)
    ProductVariant productVariant;

    /**
     * Số lượng thực tế có trong kho (tổng số lượng)
     * Bao gồm cả hàng available và hàng đang được reserved
     */
    @Column(name = "quantity_on_hand", nullable = false)
    @Min(value = 0, message = "Quantity on hand cannot be negative")
    @Builder.Default
    Integer quantityOnHand = 0;

    /**
     * Số lượng đang được giữ chỗ (pending orders chưa thanh toán)
     * Phải luôn <= quantityOnHand
     */
    @Column(name = "quantity_reserved", nullable = false)
    @Min(value = 0, message = "Quantity reserved cannot be negative")
    @Builder.Default
    Integer quantityReserved = 0;

    /**
     * Version cho Optimistic Locking
     * Tự động tăng mỗi khi entity được update
     * Ngăn chặn race condition khi nhiều request cùng update stock
     */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    // ========== Business Logic Methods ==========

    /**
     * Tính số lượng có sẵn để bán (chưa bị reserve)
     * Formula: Available = OnHand - Reserved
     */
    public Integer getAvailableQuantity() {
        return quantityOnHand - quantityReserved;
    }

    /**
     * Kiểm tra có đủ hàng available để reserve không
     */
    public boolean canReserve(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            return false;
        }
        return getAvailableQuantity() >= quantity;
    }

    /**
     * Kiểm tra có đủ hàng reserved để confirm/release không
     */
    public boolean canReleaseReserved(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            return false;
        }
        return quantityReserved >= quantity;
    }

    /**
     * Validate invariant: Reserved phải <= OnHand
     */
    public boolean isValid() {
        return quantityReserved <= quantityOnHand && 
               quantityOnHand >= 0 && 
               quantityReserved >= 0;
    }

    /**
     * Kiểm tra có còn hàng available không
     */
    public boolean isInStock() {
        return getAvailableQuantity() > 0;
    }

    /**
     * Kiểm tra có hết hàng không (kể cả reserved)
     */
    public boolean isOutOfStock() {
        return quantityOnHand == 0;
    }
}
