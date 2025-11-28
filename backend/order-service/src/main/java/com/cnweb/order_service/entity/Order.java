package com.cnweb.order_service.entity;

import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.enums.PaymentMethod;
import com.cnweb.order_service.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity - Đơn hàng
 * Thiết kế tuân thủ best practices:
 * - Immutable với @FieldDefaults
 * - Audit fields (createdAt, updatedAt)
 * - Cascade operations
 * - Proper indexing
 */
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user_id", columnList = "user_id"),
    @Index(name = "idx_order_store_id", columnList = "store_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_created_at", columnList = "created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    String orderNumber; // Mã đơn hàng hiển thị cho user (ORD-2025-001)

    @Column(name = "user_id", nullable = false)
    String username;

    @Column(name = "store_id", nullable = false)
    String storeId;

    @Column(name = "store_name", nullable = false)
    String storeName;

    // Thông tin người nhận
    @Column(name = "receiver_name", nullable = false, length = 100)
    String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    String receiverPhone;

    @Column(name = "receiver_email", length = 100)
    String receiverEmail;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    String shippingAddress;

    @Column(name = "shipping_province", length = 100)
    String shippingProvince;

    @Column(name = "shipping_ward", length = 100)
    String shippingWard;

    // Thông tin giá cả
    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    BigDecimal subtotal; // Tổng tiền sản phẩm (chưa tính phí ship, giảm giá)

    @Column(name = "discount_amount", precision = 19, scale = 2)
    @Builder.Default
    BigDecimal discountAmount = BigDecimal.ZERO; // Số tiền được giảm

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    BigDecimal totalAmount; // Tổng tiền cuối cùng = subtotal - discountAmount

    // Mã giảm giá
    @Column(name = "coupon_code", length = 50)
    String couponCode;

    @Column(name = "coupon_id")
    String couponId;

    // Trạng thái đơn hàng
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    OrderStatus status = OrderStatus.PENDING;

    // Phương thức thanh toán
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    PaymentMethod paymentMethod;

    // Trạng thái thanh toán
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "payment_transaction_id", length = 100)
    String paymentTransactionId;

    // Ghi chú
    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    String cancelReason;

    @Column(name = "cancelled_by")
    String cancelledBy; // Username người hủy đơn

    // Thời gian
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    LocalDateTime cancelledAt;

    @Column(name = "paid_at")
    LocalDateTime paidAt;

    @Column(name = "shipping_at")
    LocalDateTime shippingAt;

    @Column(name = "delivered_at")
    LocalDateTime deliveredAt;

    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderItem> items = new ArrayList<>();

    // Helper methods
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    /**
     * Tính tổng tiền đơn hàng
     */
    public void calculateTotalAmount() {
        this.subtotal = items.stream()
            .map(OrderItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalAmount = this.subtotal
            .subtract(this.discountAmount != null ? this.discountAmount : BigDecimal.ZERO);
    }

    /**
     * Kiểm tra đơn hàng có thể hủy được không
     * Chỉ có thể hủy khi đang PENDING hoặc PAID (chưa xác nhận)
     */
    public boolean canBeCancelled() {
        return status == OrderStatus.PENDING || status == OrderStatus.PAID;
    }

    /**
     * Kiểm tra đơn hàng có thể xác nhận được không
     * Chỉ có thể xác nhận khi đã PAID
     */
    public boolean canBeConfirmed() {
        return status == OrderStatus.PAID;
    }

    /**
     * Kiểm tra đơn hàng có thể chuyển sang đang vận chuyển không
     * Chỉ có thể khi đã CONFIRMED
     */
    public boolean canBeShipped() {
        return status == OrderStatus.CONFIRMED;
    }

    /**
     * Kiểm tra đơn hàng có thể xác nhận đã giao không
     * Chỉ có thể khi đang SHIPPING
     */
    public boolean canBeDelivered() {
        return status == OrderStatus.SHIPPING;
    }
}
