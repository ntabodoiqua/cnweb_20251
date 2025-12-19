package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.user.AdminUserUpdateRequest;
import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
import com.cnweb2025.user_service.dto.request.user.UserRoleChangeRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.dto.response.UserStatisticResponse;
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
            @RequestBody AdminUserUpdateRequest request
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

    @GetMapping("/statistic/users")
    public ApiResponse<UserStatisticResponse> getUserStatistic() {
        return ApiResponse.<UserStatisticResponse>builder()
                .result(adminService.getUserStatistic())
                .build();
    }

    // Lấy danh sách users đã soft delete
    @GetMapping("/users/soft-deleted")
    public ApiResponse<List<UserResponse>> getSoftDeletedUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(adminService.getSoftDeletedUsers())
                .message("Soft deleted users retrieved successfully")
                .build();
    }

    // Đếm số lượng users đã soft delete
    @GetMapping("/users/soft-deleted/count")
    public ApiResponse<Long> countSoftDeletedUsers() {
        return ApiResponse.<Long>builder()
                .result(adminService.countSoftDeletedUsers())
                .message("Count retrieved successfully")
                .build();
    }

    // Khôi phục user đã soft delete
    @PutMapping("/users/{userId}/restore")
    public ApiResponse<String> restoreUser(@PathVariable String userId) {
        return ApiResponse.<String>builder()
                .result(adminService.restoreUser(userId))
                .message("User restored successfully")
                .build();
    }


}
