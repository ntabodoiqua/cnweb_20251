package com.cnweb.order_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreationResponse {
    private List<OrderResponse> orders;
    private String paymentUrl;
    private String appTransId;
    private String message;
}
