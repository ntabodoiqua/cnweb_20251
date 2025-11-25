package com.cnweb.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    Cart cart;

    @Column(name = "product_id", nullable = false)
    String productId;

    @Column(name = "product_name", nullable = false)
    String productName;

    @Column(name = "variant_id")
    String variantId;

    @Column(name = "variant_name")
    String variantName;

    @Column(name = "store_id")
    String storeId;

    @Column(name = "store_name")
    String storeName;

    @Column(name = "image_url")
    String imageUrl;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "price", nullable = false)
    BigDecimal price;

    @Column(name = "original_price")
    BigDecimal originalPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    LocalDateTime updatedAt;
}
