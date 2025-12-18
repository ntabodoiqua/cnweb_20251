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

/**
 * Entity đại diện cho nhóm lựa chọn mà Seller tự định nghĩa cho sản phẩm.
 * 
 * Ví dụ với sản phẩm "Ốp điện thoại":
 * - Selection Group 1: "Mẫu điện thoại" -> Options: iPhone 15 Pro, iPhone 14, Samsung S24...
 * - Selection Group 2: "Kiểu vỏ" -> Options: Trong suốt, Đen bóng, Carbon...
 * 
 * Khác với ProductAttribute (Admin định nghĩa global), SelectionGroup là:
 * - Tự do định nghĩa bởi Seller
 * - Gắn với từng Product cụ thể
 * - Linh hoạt hơn (không cần theo danh mục)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "product_selection_groups", 
       indexes = {
           @Index(name = "idx_selection_group_product", columnList = "product_id"),
           @Index(name = "idx_selection_group_order", columnList = "product_id, display_order")
       },
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_product_selection_name", 
                           columnNames = {"product_id", "name"})
       })
public class ProductSelectionGroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    /**
     * Tên nhóm lựa chọn (hiển thị cho user)
     * Ví dụ: "Mẫu điện thoại", "Kiểu vỏ", "Màu sắc"
     */
    @NotBlank(message = "SELECTION_GROUP_NAME_REQUIRED")
    @Column(nullable = false, length = 100)
    String name;
    
    /**
     * Mô tả ngắn (optional)
     * Ví dụ: "Chọn mẫu điện thoại của bạn"
     */
    @Column(length = 255)
    String description;
    
    /**
     * Thứ tự hiển thị trên UI
     * Ví dụ: Mẫu điện thoại (1) -> Kiểu vỏ (2)
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    Integer displayOrder = 0;
    
    /**
     * Người dùng có bắt buộc chọn không?
     * true = phải chọn mới add to cart được
     */
    @Column(name = "is_required", nullable = false)
    @Builder.Default
    boolean isRequired = true;
    
    /**
     * Cho phép chọn nhiều option không (multiple select)
     * false = chỉ chọn 1 (radio button style)
     * true = chọn nhiều (checkbox style) - ít dùng
     */
    @Column(name = "allow_multiple", nullable = false)
    @Builder.Default
    boolean allowMultiple = false;
    
    /**
     * Có ảnh hưởng đến việc chọn variant không?
     * true = cần match option với variant để lấy đúng variant
     * false = chỉ là thông tin bổ sung (không ảnh hưởng variant selection)
     */
    @Column(name = "affects_variant", nullable = false)
    @Builder.Default
    boolean affectsVariant = true;
    
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
     * Product chứa selection group này
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    Product product;
    
    /**
     * Các options trong group này
     */
    @OneToMany(mappedBy = "selectionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    List<ProductSelectionOption> options = new ArrayList<>();
    
    // ========== Helper Methods ==========
    
    public void addOption(ProductSelectionOption option) {
        options.add(option);
        option.setSelectionGroup(this);
    }
    
    public void removeOption(ProductSelectionOption option) {
        options.remove(option);
        option.setSelectionGroup(null);
    }
}
