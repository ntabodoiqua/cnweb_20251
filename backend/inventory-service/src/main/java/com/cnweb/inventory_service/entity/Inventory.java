package com.cnweb.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", indexes = {
    @Index(name = "idx_product_id", columnList = "productId"),
    @Index(name = "idx_store_id", columnList = "storeId")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @Column(nullable = false)
    String productId;
    
    @Column(nullable = false)
    String storeId;
    
    @Column(nullable = false)
    Integer availableQuantity; // Số lượng có sẵn
    
    @Column(nullable = false)
    Integer reservedQuantity; // Số lượng đã giữ chỗ (pending orders)
    
    @Column(nullable = false)
    Integer totalQuantity; // Tổng số lượng = available + reserved
    
    @Column(nullable = false)
    Integer minStockLevel; // Mức tồn kho tối thiểu (cảnh báo)
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;
    
    /**
     * Kiểm tra xem có đủ hàng để bán không
     */
    public boolean isAvailable(int quantity) {
        return availableQuantity >= quantity;
    }
    
    /**
     * Giữ chỗ hàng (khi order được tạo)
     */
    public void reserve(int quantity) {
        if (!isAvailable(quantity)) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        availableQuantity -= quantity;
        reservedQuantity += quantity;
    }
    
    /**
     * Giải phóng hàng đã giữ chỗ (khi order bị hủy)
     */
    public void release(int quantity) {
        if (reservedQuantity < quantity) {
            throw new IllegalArgumentException("Cannot release more than reserved");
        }
        availableQuantity += quantity;
        reservedQuantity -= quantity;
    }
    
    /**
     * Xác nhận bán hàng (khi order hoàn thành)
     */
    public void confirm(int quantity) {
        if (reservedQuantity < quantity) {
            throw new IllegalArgumentException("Cannot confirm more than reserved");
        }
        reservedQuantity -= quantity;
        totalQuantity -= quantity;
    }
    
    /**
     * Thêm hàng vào kho
     */
    public void addStock(int quantity) {
        availableQuantity += quantity;
        totalQuantity += quantity;
    }
    
    /**
     * Kiểm tra xem có cần bổ sung hàng không
     */
    public boolean needsRestock() {
        return totalQuantity < minStockLevel;
    }
}
