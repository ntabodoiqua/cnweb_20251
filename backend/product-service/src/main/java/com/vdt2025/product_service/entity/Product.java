package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @NotBlank
    @Column(nullable = false)
    String name;
    String description;
    String image_name;

    @Min(value = 0, message = "Price must be at least 0")
    @Column(nullable = false, precision = 19, scale = 2)
    BigDecimal price;

    @Column(nullable = false)
    @Min(value = 0, message = "Quantity must be at least 0")
    int quantity;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    // Mối quan hệ với Category
    // Mỗi sản phẩm thuộc về một danh mục
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    Category category;

    // Mối quan hệ với User
    // Sản phẩm được tạo bởi người dùng nào
    String createdBy;

    @Column(nullable = false)
    boolean active;
}
