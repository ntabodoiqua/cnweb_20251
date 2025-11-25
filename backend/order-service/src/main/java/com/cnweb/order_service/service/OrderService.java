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
    
    OrderPaymentResponse initiatePayment(String username, List<String> orderIds);

    Page<OrderResponse> getMyOrders(String username, OrderFilterRequest filter, Pageable pageable);

    Page<OrderResponse> getStoreOrders(String requesterUsername, String storeId, OrderFilterRequest filter, Pageable pageable);
}
