package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.AdminUserUpdateRequest;
import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.dto.response.UserStatisticResponse;
import com.cnweb2025.user_service.entity.Role;
import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.UserMapper;
import com.cnweb2025.user_service.repository.RoleRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.specification.UserSpecification;
import com.cnweb2025.user_service.messaging.RabbitMQMessagePublisher;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserDeletedEvent;
import com.vdt2025.common_dto.dto.UserDeletionRequestedEvent;
import com.vdt2025.common_dto.dto.UserRecoveredEvent;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminServiceImp implements AdminService{
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RabbitMQMessagePublisher messagePublisher;

    // Lấy danh sách người dùng
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("Fetching users list");
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    // Bộ lọc người dùng
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> searchUsers(UserFilterRequest filter, Pageable pageable) {
        log.info("Filtering users with criteria: {}", filter);
        return userRepository.findAll(UserSpecification.withFilter(filter), pageable)
                .map(userMapper::toUserResponse);
    }

    // Lấy thông tin người dùng theo ID
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUserById(String id) {
        log.info("Fetching user with ID: {}", id);
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
    }

    // Cập nhật thông tin người dùng
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUser(String id, AdminUserUpdateRequest request) {
        log.info("Updating user with ID: {}", id);
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Cập nhật thông tin người dùng
        userMapper.updateUser(user, request);
        // Cập nhật vai trò người dùng
        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        // Lưu người dùng đã cập nhật
        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    // Enable tài khoản người dùng
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public String enableUser(String id) {
        log.info("Enabling user with ID: {}", id);
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.isEnabled()) {
            throw new AppException(ErrorCode.USER_ALREADY_ENABLED);
        }

        user.setEnabled(true);
        userRepository.save(user);

        return "User enabled successfully";
    }

    // Disable tài khoản người dùng
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public String disableUser(String id) {
        log.info("Disabling user with ID: {}", id);
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!user.isEnabled()) {
            throw new AppException(ErrorCode.USER_ALREADY_DISABLED);
        }
        // Admin không thể vô hiệu hóa tài khoản của chính mình
        if (user.getUsername().equals("admin")) {
            throw new AppException(ErrorCode.ADMIN_CANNOT_DISABLE_SELF);
        }
        user.setEnabled(false);
        userRepository.save(user);

        return "User disabled successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Cacheable(value = "user-stats")
    public UserStatisticResponse getUserStatistic() {
        log.info("Fetching user statistics");

        try {
            String jsonResult = userRepository.getUserStatisticsJson();
            if (jsonResult == null || jsonResult.trim().isEmpty()) {
                log.error("userRepository.getUserStatisticsJson() returned null/empty");
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }

            log.debug("raw stats json: {}", jsonResult);

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(jsonResult);

            long totalUsers = root.path("totalUsers").asLong(0L);
            long enabledUsers = root.path("enabledUsers").asLong(0L);
            long disabledUsers = root.path("disabledUsers").asLong(0L);
            long maleUsers = root.path("maleUsers").asLong(0L);
            long femaleUsers = root.path("femaleUsers").asLong(0L);
            long otherUsers = root.path("otherUsers").asLong(0L);

            Map<String, Long> usersByRole = new HashMap<>();
            JsonNode roleNode = root.path("usersByRole");
            if (roleNode.isObject()) {
                roleNode.fields().forEachRemaining(entry ->
                        usersByRole.put(entry.getKey(), entry.getValue().asLong(0L))
                );
            }

            Map<String, Long> usersByMonth = new HashMap<>();
            JsonNode monthNode = root.path("usersByMonth");
            if (monthNode.isObject()) {
                monthNode.fields().forEachRemaining(entry ->
                        usersByMonth.put(entry.getKey(), entry.getValue().asLong(0L))
                );
            }
            return UserStatisticResponse.builder()
                    .totalUsers(totalUsers)
                    .enabledUsers(enabledUsers)
                    .disabledUsers(disabledUsers)
                    .maleUsers(maleUsers)
                    .femaleUsers(femaleUsers)
                    .otherUsers(otherUsers)
                    .usersByRole(usersByRole)
                    .usersByMonth(usersByMonth)
                    .build();
        } catch (IOException e) {
            log.error("Error parsing user statistics JSON", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        } catch (Exception e) {
            log.error("Unexpected error getting user statistics", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    // ==================== Account Deletion Methods ====================

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String softDeleteUser(String userId, String reason) {
        log.info("Admin soft deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra nếu user đã bị xóa
        if (user.isDeleted()) {
            throw new AppException(ErrorCode.USER_ALREADY_DELETED);
        }

        // Không cho phép xóa tài khoản admin
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));
        if (isAdmin) {
            throw new AppException(ErrorCode.CANNOT_DELETE_ADMIN);
        }

        // Soft delete
        LocalDateTime now = LocalDateTime.now();
        user.setDeleted(true);
        user.setDeletionRequestedAt(now);
        user.setDeletedAt(now);
        user.setEnabled(false);
        userRepository.save(user);

        // Gửi event thông báo
        UserDeletionRequestedEvent event = UserDeletionRequestedEvent.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .deletionRequestedAt(now)
                .scheduledDeletionAt(now.plusDays(30))
                .reason(reason)
                .build();
        messagePublisher.publish(MessageType.USER_DELETION_REQUESTED, event);

        log.info("User {} soft deleted by admin. Grace period ends at: {}", userId, now.plusDays(30));
        return "User has been marked for deletion. Permanent deletion will occur after 30 days.";
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String hardDeleteUser(String userId) {
        log.info("Admin hard deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép xóa tài khoản admin
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));
        if (isAdmin) {
            throw new AppException(ErrorCode.CANNOT_DELETE_ADMIN);
        }

        String username = user.getUsername();
        String email = user.getEmail();

        // Gửi event trước khi xóa để các services khác cleanup
        UserDeletedEvent event = UserDeletedEvent.builder()
                .id(userId)
                .username(username)
                .email(email)
                .deletedAt(LocalDateTime.now())
                .isAdminAction(true)
                .build();
        messagePublisher.publish(MessageType.USER_DELETED, event);

        // Hard delete - xóa vĩnh viễn
        userRepository.delete(user);

        log.info("User {} permanently deleted by admin", userId);
        return "User has been permanently deleted.";
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String recoverUser(String userId) {
        log.info("Admin recovering user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra user phải đang trong trạng thái đã xóa mềm
        if (!user.isDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_DELETED);
        }

        // Khôi phục tài khoản
        user.setDeleted(false);
        user.setDeletionRequestedAt(null);
        user.setDeletedAt(null);
        user.setEnabled(true);
        userRepository.save(user);

        // Gửi event thông báo khôi phục
        UserRecoveredEvent event = UserRecoveredEvent.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .recoveredAt(LocalDateTime.now())
                .build();
        messagePublisher.publish(MessageType.USER_RECOVERED, event);

        log.info("User {} recovered by admin", userId);
        return "User has been recovered successfully.";
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getDeletedUsers(Pageable pageable) {
        log.info("Fetching deleted users");
        return userRepository.findByIsDeletedTrue(pageable)
                .map(userMapper::toUserResponse);
    }

}
