package com.vdt2025.common_dto.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", contextId = "userServiceClient", path = "/users")
public interface UserServiceClient {
    // Use internal endpoint for service-to-service communication (no auth required)
    @GetMapping("/internal/{username}")
    ApiResponse<UserResponse> getUserByUsername(@PathVariable String username);
}
