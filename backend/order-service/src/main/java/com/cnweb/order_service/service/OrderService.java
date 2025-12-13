package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.request.ProcessReturnRequest;
import com.cnweb.order_service.dto.request.ReturnOrderRequest;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.dto.response.OrderPaymentResponse;
import com.cnweb.order_service.dto.request.OrderFilterRequest;
import com.cnweb.order_service.dto.response.OrderStatisticResponse;
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
     * Thống kê đơn hàng và doanh thu cho seller
     */
    OrderStatisticResponse getOrderStatistics(String storeId);

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

    // ==================== Return & Refund Management ====================

    /**
     * Customer yêu cầu trả hàng (DELIVERED -> pending return)
     * Chỉ có thể yêu cầu trong vòng 7 ngày sau khi nhận hàng
     */
    OrderResponse requestReturn(String customerUsername, String orderId, ReturnOrderRequest request);

    /**
     * Seller xử lý yêu cầu trả hàng (approve/reject)
     * Nếu approve: DELIVERED -> RETURNED và tiến hành refund
     * Nếu reject: Giữ nguyên DELIVERED
     */
    OrderResponse processReturn(String sellerUsername, String orderId, ProcessReturnRequest request);

    /**
     * Lấy danh sách đơn hàng đang chờ xử lý trả hàng của store
     */
    Page<OrderResponse> getPendingReturnOrders(String sellerUsername, String storeId, Pageable pageable);
}
