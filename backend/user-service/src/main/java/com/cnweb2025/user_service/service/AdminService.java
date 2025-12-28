package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.AdminUserUpdateRequest;
import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
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

    // ==================== Account Deletion Methods ====================

    /**
     * Admin soft delete user - Bắt đầu grace period 30 ngày
     * @param userId ID của user cần xóa
     * @param reason Lý do xóa (required for admin action)
     * @return Message thông báo kết quả
     */
    String softDeleteUser(String userId, String reason);

    /**
     * Admin hard delete user - Xóa vĩnh viễn (chỉ dùng khi grace period đã hết hoặc có lý do đặc biệt)
     * @param userId ID của user cần xóa
     * @return Message thông báo kết quả
     */
    String hardDeleteUser(String userId);

    /**
     * Admin khôi phục user đã bị soft delete
     * @param userId ID của user cần khôi phục
     * @return Message thông báo kết quả
     */
    String recoverUser(String userId);

    /**
     * Lấy danh sách users đã bị soft delete (pending deletion)
     * @param pageable Pagination info
     * @return Page of deleted users
     */
    Page<UserResponse> getDeletedUsers(Pageable pageable);

}
