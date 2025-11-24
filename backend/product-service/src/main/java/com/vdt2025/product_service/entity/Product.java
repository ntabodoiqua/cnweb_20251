package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
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
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @NotBlank(message = "PRODUCT_NAME_REQUIRED")
    @Column(nullable = false)
    String name;

    @Column(columnDefinition = "TEXT", name = "description")
    String description;

    @Column(name = "short_description", length = 500)
    String shortDescription; // Mô tả ngắn hiển thị trên danh sách

    @Column(name = "view_count")
    @Builder.Default
    Long viewCount = 0L; // Số lượt xem

    @Column(name = "sold_count")
    @Builder.Default
    Integer soldCount = 0; // Tổng số đã bán

    @Column(name = "average_rating")
    Double averageRating; // Điểm đánh giá trung bình

    @Column(name = "min_price")
    BigDecimal minPrice; // Giá thấp nhất trong các variants

    @Column(name = "max_price")
    BigDecimal maxPrice; // Giá cao nhất trong các variants

    @Column(name = "rating_count")
    @Builder.Default
    Integer ratingCount = 0; // Số lượng đánh giá

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = true;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    // Relationship với Store
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    Store store;

    // Relationship với Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    Category category;

    // Relationship với store category
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_store_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    List<Category> storeCategories = new ArrayList<>();

    // Relationship với Brand
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    Brand brand;

    // Relationship với ProductVariant
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductVariant> variants = new ArrayList<>();

    // Relationship với ProductImage
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductImage> images = new ArrayList<>();

    // Relationship với ProductRating
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductRating> ratings = new ArrayList<>();

    // Người tạo sản phẩm
    @Column(name = "created_by")
    String createdBy;


}
