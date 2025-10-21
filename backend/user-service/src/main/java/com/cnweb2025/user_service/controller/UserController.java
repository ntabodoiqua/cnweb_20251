package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.user.UserChangePasswordRequest;
import com.cnweb2025.user_service.dto.request.user.UserCreationRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.service.UserServiceImp;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserServiceImp userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @GetMapping("/{username}")
    ApiResponse<UserResponse> getUserByUsername(@PathVariable String username) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserByUsername(username))
                .build();
    }

    @PutMapping("/changePassword")
    ApiResponse<String> changeMyPassword(@RequestBody @Valid UserChangePasswordRequest request) {
        var result = userService.changeMyPassword(request.getOldPassword(), request.getNewPassword());
        return ApiResponse.<String>builder()
                .result(result)
                .build();
    }

    // Controller người dùng cập nhật avatar
    @PostMapping("/avatar")
    public ApiResponse<String> setAvatar(@RequestParam("file") MultipartFile file) {
        var result = userService.setMyAvatar(file);
        return ApiResponse.<String>builder()
                .message("Avatar updated successfully")
                .result(result)
                .build();
    }

    // Controller người dùng cập nhật thông tin cá nhân
    @PutMapping("/myInfo")
    public ApiResponse<UserResponse> updateMyInfo(@RequestBody @Valid UserUpdateRequest request) {
        var result = userService.updateMyInfo(request);
        return ApiResponse.<UserResponse>builder()
                .result(result)
                .build();
    }

    // Controller người dùng vô hiệu hóa tài khoản
    @PutMapping("/disable")
    public ApiResponse<String> disableMyAccount() {
        var result = userService.disableMyAccount();
        return ApiResponse.<String>builder()
                .message("Account disabled successfully")
                .result(result)
                .build();
    }

}
