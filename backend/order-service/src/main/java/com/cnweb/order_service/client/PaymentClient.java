package com.cnweb.order_service.client;

import com.cnweb.order_service.dto.payment.CreatePaymentRequest;
import com.cnweb.order_service.dto.payment.CreatePaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for payment-service APIs
 */
@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/v1/payments/zalopay/create-order")
    CreatePaymentResponse createZaloPayOrder(@RequestBody CreatePaymentRequest request);
}
