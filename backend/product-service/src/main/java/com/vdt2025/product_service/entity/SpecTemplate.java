package com.vdt2025.product_service.entity;

import com.vdt2025.product_service.dto.SpecAttribute;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entity lưu trữ template specs cho mỗi category
 * Giúp seller dễ dàng chọn và thêm specs vào sản phẩm
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "spec_templates")
public class SpecTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    /**
     * Tên của template
     * VD: "Smartphone Specs", "Laptop Specs"
     */
    @Column(nullable = false)
    String name;
    
    /**
     * Mô tả về template này
     */
    @Column(columnDefinition = "TEXT")
    String description;
    
    /**
     * Category mà template này áp dụng
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    Category category;
    
    /**
     * Map các specs mẫu
     * Key: spec key
     * Value: SpecAttribute với đầy đủ thông tin (không bao gồm value)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "spec_fields", columnDefinition = "jsonb", nullable = false)
    Map<String, SpecAttribute> specFields;
    
    /**
     * Template có active hay không
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;
    
    /**
     * Thứ tự hiển thị
     */
    @Column(name = "display_order")
    @Builder.Default
    Integer displayOrder = 999;
    
    /**
     * Người tạo template (admin)
     */
    @Column(name = "created_by")
    String createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;
}
