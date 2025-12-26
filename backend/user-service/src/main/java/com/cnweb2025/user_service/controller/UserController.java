package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.otp.ResendOtpRequest;
import com.cnweb2025.user_service.dto.request.otp.ResetPasswordRequest;
import com.cnweb2025.user_service.dto.request.otp.VerifyEmailRequest;
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
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserServiceImp userService;
    MessageSource messageSource;

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

    // Internal endpoint for service-to-service communication (no authentication required)
    @GetMapping("/internal/{username}")
    ApiResponse<UserResponse> getUserByUsernameInternal(@PathVariable String username) {
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
    public ApiResponse<String> setAvatar(@RequestParam("file") MultipartFile file, Locale locale) {
        var result = userService.setMyAvatar(file);
        return ApiResponse.<String>builder()
                .message(messageSource.getMessage("user.avatar.update.success", null, locale))
                .result(result)
                .build();
    }

    // Controller người dùng lấy avatar
    @GetMapping("/avatar")
    public ApiResponse<String> getMyAvatarLink(Locale locale) {
        var result = userService.getMyAvatarLink();
        return ApiResponse.<String>builder()
                .message(messageSource.getMessage("user.avatar.retrieved.success", null, locale))
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

    // Controller xác thực email bằng OTP
    @PostMapping("/verify-email")
    public ApiResponse<String> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        var result = userService.verifyEmail(request.getUsername(), request.getOtpCode());
        return ApiResponse.<String>builder()
                .message("Email verification successful")
                .result(result)
                .build();
    }

    // Controller gửi lại OTP
    @PostMapping("/resend-otp")
    public ApiResponse<String> resendOtp(@RequestBody @Valid ResendOtpRequest request) {
        var result = userService.resendOtp(request.getUsername());
        return ApiResponse.<String>builder()
                .message("OTP resent successfully")
                .result(result)
                .build();
    }

    // Controller gửi lại OTP đặt lại mật khẩu
    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody @Valid ResendOtpRequest request) {
        var result = userService.forgotPassword(request.getUsername());
        return ApiResponse.<String>builder()
                .message("Password reset OTP sent successfully")
                .result(result)
                .build();
    }

    // Controller đặt lại mật khẩu bằng OTP
    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        var result = userService.resetPassword(request.getUsername(), request.getOtpCode(), request.getNewPassword());
        return ApiResponse.<String>builder()
                .message("Password reset successful")
                .result(result)
                .build();
    }

}
