package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    List<OrderResponse> createOrder(String username, OrderCreationRequest request);
}
