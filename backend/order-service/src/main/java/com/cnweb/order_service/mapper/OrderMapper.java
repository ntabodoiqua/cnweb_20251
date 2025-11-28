package com.cnweb.order_service.mapper;

import com.cnweb.order_service.dto.request.OrderCreationRequest;
import com.cnweb.order_service.dto.response.OrderItemResponse;
import com.cnweb.order_service.dto.response.OrderResponse;
import com.cnweb.order_service.entity.Order;
import com.cnweb.order_service.entity.OrderItem;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.*;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    
    @Mapping(target = "returnImages", expression = "java(parseReturnImages(order.getReturnImages()))")
    @Mapping(target = "canBeReturned", expression = "java(order.canBeReturned())")
    @Mapping(target = "canProcessReturn", expression = "java(order.canProcessReturn())")
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
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "returnReason", ignore = true)
    @Mapping(target = "returnDescription", ignore = true)
    @Mapping(target = "returnImages", ignore = true)
    @Mapping(target = "returnRequestedAt", ignore = true)
    @Mapping(target = "returnProcessedAt", ignore = true)
    @Mapping(target = "returnProcessedBy", ignore = true)
    @Mapping(target = "returnRejectionReason", ignore = true)
    @Mapping(target = "refundStatus", ignore = true)
    @Mapping(target = "refundAmount", ignore = true)
    @Mapping(target = "refundTransactionId", ignore = true)
    @Mapping(target = "refundedAt", ignore = true)
    @Mapping(target = "returnedAt", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paymentStatus", constant = "UNPAID")
    Order toOrder(OrderCreationRequest request);

    default List<String> parseReturnImages(String returnImagesJson) {
        if (returnImagesJson == null || returnImagesJson.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(returnImagesJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
