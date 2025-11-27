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

/**
 * Entity đại diện cho một lựa chọn cụ thể trong SelectionGroup.
 * 
 * Ví dụ với SelectionGroup "Mẫu điện thoại":
 * - Option 1: "iPhone 15 Pro Max"
 * - Option 2: "iPhone 15 Pro" 
 * - Option 3: "Samsung Galaxy S24 Ultra"
 * 
 * Mỗi option có thể có:
 * - Hình ảnh riêng (hiển thị preview)
 * - Điều chỉnh giá (tăng/giảm so với giá gốc)
 * - Liên kết với các variants tương ứng
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "product_selection_options",
       indexes = {
           @Index(name = "idx_selection_option_group", columnList = "selection_group_id"),
           @Index(name = "idx_selection_option_order", columnList = "selection_group_id, display_order")
       },
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_group_option_value", 
                           columnNames = {"selection_group_id", "value"})
       })
public class ProductSelectionOption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    /**
     * Giá trị option (hiển thị cho user)
     * Ví dụ: "iPhone 15 Pro Max", "Đen Carbon", "Size L"
     */
    @NotBlank(message = "SELECTION_OPTION_VALUE_REQUIRED")
    @Column(nullable = false, length = 100)
    String value;
    
    /**
     * Nhãn hiển thị (optional, nếu khác value)
     * Ví dụ: value = "iphone_15_pro", label = "iPhone 15 Pro"
     */
    @Column(length = 100)
    String label;
    
    /**
     * Mô tả chi tiết option (optional)
     */
    @Column(length = 500)
    String description;
    
    /**
     * Thứ tự hiển thị trong group
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    Integer displayOrder = 0;
    
    /**
     * Hình ảnh đại diện cho option (optional)
     * Ví dụ: Hình iPhone 15 Pro, hình vỏ đen...
     */
    @Column(name = "image_name")
    String imageName;
    
    @Column(name = "image_url", columnDefinition = "TEXT")
    String imageUrl;
    
    /**
     * Điều chỉnh giá khi chọn option này
     * Ví dụ: +50000 VNĐ cho vỏ carbon cao cấp
     * null hoặc 0 = không thay đổi giá
     */
    @Column(name = "price_adjustment", precision = 19, scale = 2)
    BigDecimal priceAdjustment;
    
    /**
     * Mã màu HEX nếu option là màu sắc
     * Ví dụ: "#FF0000" cho màu đỏ
     */
    @Column(name = "color_code", length = 10)
    String colorCode;
    
    /**
     * Số lượng tồn kho riêng (optional)
     * Nếu null, sử dụng stock của variant
     */
    @Column(name = "stock_quantity")
    Integer stockQuantity;
    
    /**
     * Có available không (còn hàng, còn bán)
     */
    @Column(name = "is_available", nullable = false)
    @Builder.Default
    boolean isAvailable = true;
    
    /**
     * Trạng thái active
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;
    
    // ========== Relationships ==========
    
    /**
     * Selection group chứa option này
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selection_group_id", nullable = false)
    ProductSelectionGroup selectionGroup;
    
    /**
     * Các variants được liên kết với option này
     * Một variant có thể có nhiều options (từ các groups khác nhau)
     * Một option có thể liên kết với nhiều variants
     */
    @ManyToMany
    @JoinTable(
        name = "variant_selection_options",
        joinColumns = @JoinColumn(name = "option_id"),
        inverseJoinColumns = @JoinColumn(name = "variant_id")
    )
    @Builder.Default
    List<ProductVariant> variants = new ArrayList<>();
    
    // ========== Helper Methods ==========
    
    /**
     * Lấy label để hiển thị (ưu tiên label, fallback về value)
     */
    public String getDisplayLabel() {
        return label != null && !label.isBlank() ? label : value;
    }
    
    /**
     * Kiểm tra option này có thể chọn được không
     */
    public boolean isSelectable() {
        return isActive && isAvailable;
    }
}
