package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu lịch sử thay đổi tồn kho (Audit Trail)
 * 
 * Best Practices:
 * - Immutable: Không cho phép update/delete transactions
 * - Comprehensive: Lưu đầy đủ thông tin before/after, reason, user
 * - Performance: Index theo variantId và createdAt để query nhanh
 * - Compliance: Đáp ứng yêu cầu audit và compliance
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(
    name = "inventory_transactions",
    indexes = {
        @Index(name = "idx_inv_tx_variant", columnList = "variant_id"),
        @Index(name = "idx_inv_tx_type", columnList = "transaction_type"),
        @Index(name = "idx_inv_tx_created", columnList = "created_at"),
        @Index(name = "idx_inv_tx_reference", columnList = "reference_type, reference_id")
    }
)
public class InventoryTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    ProductVariant variant;

    /**
     * Loại giao dịch
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 50)
    TransactionType transactionType;

    /**
     * Số lượng thay đổi (có thể âm hoặc dương)
     * - Dương: tăng stock (nhập hàng, hoàn hàng)
     * - Âm: giảm stock (bán hàng, hủy hàng)
     */
    @Column(name = "quantity_change", nullable = false)
    Integer quantityChange;

    /**
     * Trạng thái TRƯỚC khi thay đổi
     */
    @Column(name = "quantity_before", nullable = false)
    Integer quantityBefore;

    /**
     * Trạng thái SAU khi thay đổi
     */
    @Column(name = "quantity_after", nullable = false)
    Integer quantityAfter;

    /**
     * Reserved TRƯỚC khi thay đổi
     */
    @Column(name = "reserved_before", nullable = false)
    Integer reservedBefore;

    /**
     * Reserved SAU khi thay đổi
     */
    @Column(name = "reserved_after", nullable = false)
    Integer reservedAfter;

    /**
     * Lý do thay đổi
     */
    @Column(name = "reason", columnDefinition = "TEXT")
    String reason;

    /**
     * User thực hiện (username hoặc system)
     */
    @Column(name = "performed_by", length = 100)
    String performedBy;

    /**
     * Reference type (ORDER, ADJUSTMENT, RETURN, etc.)
     */
    @Column(name = "reference_type", length = 50)
    String referenceType;

    /**
     * Reference ID (order_id, adjustment_id, etc.)
     */
    @Column(name = "reference_id", length = 100)
    String referenceId;

    /**
     * Metadata JSON (optional)
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    /**
     * Enum các loại transaction
     */
    public enum TransactionType {
        INITIAL_STOCK,          // Khởi tạo tồn kho ban đầu
        STOCK_IN,               // Nhập hàng
        STOCK_OUT,              // Xuất hàng (bán)
        STOCK_ADJUSTMENT,       // Điều chỉnh tồn kho (admin/seller)
        RESERVE,                // Giữ chỗ hàng (place order)
        RELEASE_RESERVATION,    // Xả hàng giữ chỗ (cancel order)
        CONFIRM_SALE,           // Xác nhận bán (payment success)
        RETURN,                 // Hoàn hàng
        DAMAGE,                 // Hàng hỏng
        LOST,                   // Mất hàng
        TRANSFER_IN,            // Chuyển kho vào
        TRANSFER_OUT,           // Chuyển kho ra
        MANUAL_ADJUSTMENT       // Điều chỉnh thủ công
    }
}
