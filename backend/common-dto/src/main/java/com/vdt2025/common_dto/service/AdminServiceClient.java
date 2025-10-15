package com.vdt2025.common_dto.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", contextId = "adminServiceClient", path = "/admin")
public interface AdminServiceClient {
    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId);

}
