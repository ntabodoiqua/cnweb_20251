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
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"name", "category_type", "store_id"})
        },
        indexes = {
                @Index(name = "idx_category_type", columnList = "category_type"),
                @Index(name = "idx_store_id", columnList = "store_id"),
                @Index(name = "idx_parent_id", columnList = "parent_id")
        }
)
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @NotBlank(message = "CATEGORY_NAME_NOT_BLANK")
    @Column(nullable = false)
    String name;

    /**
     * Loại danh mục:
     * - PLATFORM: Danh mục toàn hệ thống do Admin tạo (có thể 2 cấp)
     * - STORE: Danh mục riêng của Store do Seller tạo (chỉ 1 cấp)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false)
    @Builder.Default
    CategoryType categoryType = CategoryType.PLATFORM;

    /**
     * ID của Store (chỉ áp dụng cho STORE_CATEGORY)
     * NULL nếu là PLATFORM_CATEGORY
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    Store store;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "image_name")
    String imageName;

    @Column(name = "image_url", columnDefinition = "TEXT")
    String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = true;

    /**
     * Cấp độ của danh mục (0 = root, 1 = level 1, 2 = level 2)
     * PLATFORM_CATEGORY: cho phép level 0, 1, 2
     * STORE_CATEGORY: chỉ cho phép level 0 (không có parent)
     */
    @Column(name = "level", nullable = false)
    @Builder.Default
    Integer level = 0;

    // Relationship với Product
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @Builder.Default
    List<Product> products = new ArrayList<>();

    @Column(name = "created_by", nullable = false, updatable = false)
    @ManyToMany(mappedBy = "storeCategories", fetch = FetchType.LAZY)
    List<Product> storeProducts = new ArrayList<>();

    @Column(name = "created_by", nullable = false, updatable = false)
    String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    /**
     * Parent category (chỉ áp dụng cho PLATFORM_CATEGORY)
     * STORE_CATEGORY không được có parent (luôn là root level)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    Category parentCategory;

    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL)
    @Builder.Default
    List<Category> subCategories = new ArrayList<>();

    /**
     * Kiểm tra xem category này có phải là Platform category không
     */
    public boolean isPlatformCategory() {
        return categoryType == CategoryType.PLATFORM;
    }

    /**
     * Kiểm tra xem category này có phải là Store category không
     */
    public boolean isStoreCategory() {
        return categoryType == CategoryType.STORE;
    }

    /**
     * Kiểm tra xem category này có phải là root category không
     */
    public boolean isRootCategory() {
        return parentCategory == null;
    }

    /**
     * Enum cho loại danh mục
     */
    public enum CategoryType {
        PLATFORM,  // Danh mục toàn hệ thống (Admin quản lý, 2 cấp)
        STORE      // Danh mục riêng của Store (Seller quản lý, 1 cấp)
    }
}