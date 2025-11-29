package com.vdt2025.product_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign Client để gọi Order Service
 * Sử dụng để xác thực user đã mua sản phẩm chưa
 */
@FeignClient(name = "order-service", path = "/internal/orders")
public interface OrderClient {

    /**
     * Kiểm tra user đã mua sản phẩm (đơn hàng đã DELIVERED) chưa
     */
    @GetMapping("/verify-purchase")
    ApiResponse<Boolean> verifyPurchase(
            @RequestParam("username") String username,
            @RequestParam("productId") String productId);

    /**
     * Lấy orderId của đơn hàng DELIVERED chứa sản phẩm
     */
    @GetMapping("/delivered-order-id")
    ApiResponse<String> getDeliveredOrderId(
            @RequestParam("username") String username,
            @RequestParam("productId") String productId);
}
