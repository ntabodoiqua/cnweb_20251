package com.cnweb.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * OrderItem Entity - Chi tiết sản phẩm trong đơn hàng
 */
@Entity
@Table(name = "order_items", indexes = {
    @Index(name = "idx_order_item_order_id", columnList = "order_id"),
    @Index(name = "idx_order_item_product_id", columnList = "product_id"),
    @Index(name = "idx_order_item_variant_id", columnList = "variant_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    // Thông tin sản phẩm (snapshot tại thời điểm đặt hàng)
    @Column(name = "store_id", nullable = false)
    String storeId;

    @Column(name = "store_name", nullable = false)
    String storeName;

    @Column(name = "product_id", nullable = false)
    String productId;

    @Column(name = "product_name", nullable = false)
    String productName;

    @Column(name = "variant_id", nullable = false)
    String variantId;

    @Column(name = "variant_name")
    String variantName; // Ví dụ: "Màu Trắng - Size L"

    @Column(name = "sku", length = 100)
    String sku;

    @Column(name = "product_image", columnDefinition = "TEXT")
    String productImage; // URL ảnh sản phẩm

    // Giá và số lượng
    @Column(name = "price", nullable = false, precision = 19, scale = 2)
    BigDecimal price; // Giá tại thời điểm đặt hàng

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "total_price", nullable = false, precision = 19, scale = 2)
    BigDecimal totalPrice; // = price * quantity

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    /**
     * Tính tổng tiền cho item này
     */
    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (price != null && quantity != null) {
            this.totalPrice = price.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
