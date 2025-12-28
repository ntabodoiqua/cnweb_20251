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

    // ==================== Account Deletion Methods ====================

    /**
     * Yêu cầu xóa tài khoản - Gửi OTP để xác nhận
     * @return Message thông báo đã gửi OTP
     */
    String requestAccountDeletion();

    /**
     * Xác nhận xóa tài khoản với OTP - Bắt đầu grace period 30 ngày
     * @param otpCode Mã OTP xác nhận
     * @param reason Lý do xóa (optional)
     * @return Message thông báo đã xóa mềm và bắt đầu grace period
     */
    String confirmAccountDeletion(String otpCode, String reason);

    /**
     * Hủy yêu cầu xóa tài khoản trong grace period
     * @return Message thông báo đã hủy yêu cầu xóa
     */
    String cancelAccountDeletion();

    /**
     * Khôi phục tài khoản đã xóa mềm (trong grace period)
     * @param username Username của tài khoản cần khôi phục
     * @param otpCode Mã OTP xác nhận (gửi qua email)
     * @return Message thông báo đã khôi phục
     */
    String recoverAccount(String username, String otpCode);

    /**
     * Gửi OTP để khôi phục tài khoản đã xóa
     * @param username Username của tài khoản cần khôi phục
     * @return Message thông báo đã gửi OTP
     */
    String sendRecoveryOtp(String username);
}
