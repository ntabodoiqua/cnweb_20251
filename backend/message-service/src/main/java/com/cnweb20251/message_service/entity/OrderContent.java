package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Embedded document chứa thông tin đơn hàng được chia sẻ trong tin nhắn.
 * Dữ liệu được lấy từ order-service và lưu snapshot tại thời điểm gửi.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderContent {

    /**
     * ID của đơn hàng từ order-service.
     */
    private String orderId;

    /**
     * Mã đơn hàng hiển thị cho người dùng.
     */
    private String orderCode;

    /**
     * Trạng thái đơn hàng.
     */
    private OrderStatus status;

    /**
     * Tổng giá trị đơn hàng.
     */
    private BigDecimal totalAmount;

    /**
     * Đơn vị tiền tệ.
     */
    @Builder.Default
    private String currency = "VND";

    /**
     * Danh sách các sản phẩm trong đơn hàng (tóm tắt).
     */
    private List<OrderItem> items;

    /**
     * Số lượng sản phẩm trong đơn hàng.
     */
    private Integer itemCount;

    /**
     * Thông tin shop.
     */
    private String shopId;
    private String shopName;

    /**
     * Thời gian đặt hàng.
     */
    private Instant orderedAt;

    /**
     * Thời gian giao hàng dự kiến.
     */
    private Instant estimatedDeliveryAt;

    /**
     * URL deeplink đến trang chi tiết đơn hàng.
     */
    private String orderUrl;

    /**
     * Thông tin vận chuyển (nếu có).
     */
    private ShippingInfo shipping;

    /**
     * Text ghi chú thêm khi chia sẻ đơn hàng.
     */
    private String note;
}
