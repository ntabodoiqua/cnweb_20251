package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "product_attributes")
public class ProductAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @NotBlank(message = "ATTRIBUTE_NAME_REQUIRED")
    @Column(nullable = false, unique = true)
    String name; // Ví dụ: "Màu sắc", "Kích cỡ", "Dung lượng"

    @ManyToMany
    @JoinTable(
            name = "attribute_categories",
            joinColumns = @JoinColumn(name = "attribute_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    List<Category> categories = new ArrayList<>(); // Các danh mục áp dụng thuộc tính này

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    // Relationship với AttributeValue
    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<AttributeValue> values = new ArrayList<>();
}
