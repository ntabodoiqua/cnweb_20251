package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.dto.response.OrderPaymentResponse;

import java.util.List;

public interface OrderService {
    List<OrderResponse> createOrder(String username, OrderCreationRequest request);
    
    List<OrderResponse> applyCouponToOrders(String username, String couponCode, List<String> orderIds);
    
    OrderPaymentResponse initiatePayment(String username, List<String> orderIds);
}
