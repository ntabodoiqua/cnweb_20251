package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.AdminUserUpdateRequest;
import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.dto.response.UserStatisticResponse;
import com.cnweb2025.user_service.entity.Role;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.UserMapper;
import com.cnweb2025.user_service.repository.RoleRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.specification.UserSpecification;
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

import java.io.IOException;
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

}
