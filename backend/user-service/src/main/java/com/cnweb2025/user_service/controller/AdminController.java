package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
import com.cnweb2025.user_service.dto.request.user.UserRoleChangeRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.service.AdminServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    AdminServiceImp adminService;

    // Lấy danh sách người dùng
    @GetMapping
    public ApiResponse<Page<UserResponse>> getUsers(
            @ModelAttribute UserFilterRequest filter,
            Pageable pageable
    ) {
        return ApiResponse.<Page<UserResponse>>builder()
                .result(adminService.searchUsers(filter, pageable))
                .build();
    }

    // Lấy thông tin người dùng theo ID
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.getUserById(userId))
                .build();
    }

    // Cập nhật thông tin người dùng
    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable("userId") String userId,
            @RequestBody UserUpdateRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.updateUser(userId, request))
                .build();
    }

    // Enable người dùng
    @PutMapping("/{userId}/enable")
    public ApiResponse<String> enableUser(@PathVariable String userId) {
        return ApiResponse.<String>builder()
                .result(adminService.enableUser(userId))
                .message("User enabled successfully")
                .build();
    }

    // Disable người dùng
    @PutMapping("/{userId}/disable")
    public ApiResponse<String> disableUser(@PathVariable String userId) {
        return ApiResponse.<String>builder()
                .result(adminService.disableUser(userId))
                .message("User disabled successfully")
                .build();
    }

    // Cập nhật vai trò của người dùng
    @PutMapping("/{userId}/role")
    public ApiResponse<UserResponse> updateUserRole(
            @PathVariable String userId,
            @RequestBody UserRoleChangeRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .result(adminService.updateUserRole(userId, request.getRoleName()))
                .message("User role updated successfully")
                .build();
    }
}
