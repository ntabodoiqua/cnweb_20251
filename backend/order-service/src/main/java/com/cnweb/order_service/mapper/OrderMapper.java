package com.cnweb.order_service.mapper;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.response.OrderItemResponse;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    
    OrderResponse toOrderResponse(Order order);
    
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "discountAmount", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "couponId", ignore = true)
    @Mapping(target = "paymentTransactionId", ignore = true)
    @Mapping(target = "cancelReason", ignore = true)
    @Mapping(target = "cancelledBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "confirmedAt", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paymentStatus", constant = "UNPAID")
    Order toOrder(OrderCreationRequest request);
}
