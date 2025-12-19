package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.AdminUserUpdateRequest;
import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {

    List<UserResponse> getUsers();

    Page<UserResponse> searchUsers(UserFilterRequest filter, Pageable pageable);

    UserResponse getUserById(String id);

    UserResponse updateUser(String id, AdminUserUpdateRequest request);

    String enableUser(String id);

    String disableUser(String id);

    // Soft Delete Management
    List<UserResponse> getSoftDeletedUsers();

    long countSoftDeletedUsers();

    String restoreUser(String id);

}
