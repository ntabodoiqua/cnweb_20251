package com.vdt2025.product_service.entity;

import com.vdt2025.product_service.dto.SpecAttribute;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @NotBlank(message = "SKU is required")
    @Column(nullable = false, unique = true)
    String sku; // Mã SKU duy nhất

    @Column(name = "variant_name")
    String variantName; // Ví dụ: "Áo Sơ Mi - Trắng - Size L"

    @Min(value = 0, message = "Price must be at least 0")
    @Column(nullable = false, precision = 19, scale = 2)
    BigDecimal price;

    @Column(name = "original_price", precision = 19, scale = 2)
    BigDecimal originalPrice; // Giá gốc

    @Column(name = "sold_quantity")
    @Builder.Default
    Integer soldQuantity = 0;

    @Column(name = "image_name")
    String imageName; // Ảnh đại diện cho variant này

    @Column(name = "image_url", columnDefinition = "TEXT")
    String imageUrl; // URL ảnh đại diện

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = false;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    boolean isDeleted = false;

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

    // Many-to-Many với AttributeValue
    // Ví dụ: variant này có thuộc tính "Màu Trắng" và "Size L"
    @ManyToMany
    @JoinTable(
            name = "variant_attribute_values",
            joinColumns = @JoinColumn(name = "variant_id"),
            inverseJoinColumns = @JoinColumn(name = "attribute_value_id")
    )
    @Builder.Default
    List<AttributeValue> attributeValues = new ArrayList<>();

    // One-to-One với InventoryStock
    // Được map bởi productVariant field trong InventoryStock entity
    @OneToOne(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    InventoryStock inventoryStock;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, SpecAttribute> metadata;
}
