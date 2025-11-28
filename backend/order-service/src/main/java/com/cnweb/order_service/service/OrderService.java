package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.dto.response.OrderPaymentResponse;
import com.cnweb.order_service.dto.request.OrderFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    List<OrderResponse> createOrder(String username, OrderCreationRequest request);
    
    List<OrderResponse> applyCouponToOrders(String username, String couponCode, List<String> orderIds);

    OrderPaymentResponse initiatePayment(String username, com.cnweb.order_service.dto.request.OrderPaymentRequest request);

    Page<OrderResponse> getMyOrders(String username, OrderFilterRequest filter, Pageable pageable);

    Page<OrderResponse> getStoreOrders(String requesterUsername, String storeId, OrderFilterRequest filter, Pageable pageable);

    Page<OrderResponse> getAllOrdersForAdmin(OrderFilterRequest filter, Pageable pageable);

    // ==================== Order Status Management ====================

    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    OrderResponse getOrderById(String username, String orderId);

    /**
     * Seller xác nhận đơn hàng (PAID -> CONFIRMED)
     */
    OrderResponse confirmOrder(String sellerUsername, String orderId);

    /**
     * Seller chuyển đơn hàng sang trạng thái đang vận chuyển (CONFIRMED -> SHIPPING)
     */
    OrderResponse shipOrder(String sellerUsername, String orderId);

    /**
     * Customer xác nhận đã nhận hàng (SHIPPING -> DELIVERED)
     */
    OrderResponse deliverOrder(String customerUsername, String orderId);

    /**
     * Hủy đơn hàng (PENDING/PAID -> CANCELLED)
     * Có thể do customer hoặc seller thực hiện
     */
    OrderResponse cancelOrder(String username, String orderId, String cancelReason);
}
