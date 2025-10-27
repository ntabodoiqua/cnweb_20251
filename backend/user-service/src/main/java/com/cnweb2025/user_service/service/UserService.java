package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.UserCreationRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserResponse createUser(UserCreationRequest request);

    UserResponse getMyInfo();

    String changeMyPassword(String oldPassword, String newPassword);

    String setMyAvatar(MultipartFile file);

    UserResponse updateMyInfo(UserUpdateRequest request);

    UserResponse getUserByUsername(String username);

    String disableMyAccount();
    
    String verifyEmail(String username, String otpCode);
    
    String resendOtp(String username);

    String forgotPassword(String username);

    String resetPassword(String username, String otpCode, String newPassword);

    String getMyAvatarLink();
}
