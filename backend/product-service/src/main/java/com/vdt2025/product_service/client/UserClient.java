package com.vdt2025.product_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.BatchUsernamesRequest;
import com.vdt2025.product_service.dto.response.UserInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign Client để gọi User Service
 * Sử dụng để lấy thông tin người dùng cho đánh giá
 */
@FeignClient(name = "user-service", path = "/users")
public interface UserClient {

    /**
     * Lấy thông tin user theo username (internal endpoint)
     */
    @GetMapping("/internal/{username}")
    ApiResponse<UserInfoResponse> getUserByUsername(@PathVariable("username") String username);

    /**
     * Lấy thông tin nhiều users cùng lúc theo danh sách usernames
     */
    @PostMapping("/internal/batch")
    ApiResponse<Map<String, UserInfoResponse>> getUsersByUsernames(@RequestBody BatchUsernamesRequest request);
}
