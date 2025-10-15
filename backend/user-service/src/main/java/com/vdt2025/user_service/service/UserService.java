package com.vdt2025.user_service.service;

import com.vdt2025.user_service.dto.request.user.UserCreationRequest;
import com.vdt2025.user_service.dto.request.user.UserUpdateRequest;
import com.vdt2025.user_service.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserResponse createUser(UserCreationRequest request);

    UserResponse getMyInfo();

    String changeMyPassword(String oldPassword, String newPassword);

    String setMyAvatar(MultipartFile file);

    UserResponse updateMyInfo(UserUpdateRequest request);

    UserResponse getUserByUsername(String username);

    String disableMyAccount();
}
