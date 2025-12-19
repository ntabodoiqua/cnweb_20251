package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.UserCreationRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserInfoSimpleResponse;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface UserService {

    UserResponse createUser(UserCreationRequest request);

    UserResponse getMyInfo();

    String changeMyPassword(String oldPassword, String newPassword);

    String setMyAvatar(MultipartFile file);

    UserResponse updateMyInfo(UserUpdateRequest request);

    UserResponse getUserByUsername(String username);

    String disableMyAccount();
    
    String softDeleteMyAccount();

    String verifyEmail(String username, String otpCode);
    
    String resendOtp(String username);

    String forgotPassword(String username);

    String resetPassword(String username, String otpCode, String newPassword);

    String getMyAvatarLink();

    User findOrCreateGoogleUser(String email, String name, String picture);

    /**
     * Lấy thông tin đơn giản của nhiều users theo danh sách usernames
     * Sử dụng cho internal service-to-service communication
     */
    Map<String, UserInfoSimpleResponse> getUsersByUsernames(List<String> usernames);
}
