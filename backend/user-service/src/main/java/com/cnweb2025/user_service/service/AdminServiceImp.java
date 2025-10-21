package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.UserFilterRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.entity.Role;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.UserMapper;
import com.cnweb2025.user_service.repository.RoleRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.specification.UserSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        log.info("Updating user with ID: {}", id);
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Cập nhật thông tin người dùng
        userMapper.updateUser(user, request);

        // Lưu người dùng đã cập nhật
        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    // Cập nhật role cho người dùng
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserRole(String id, String roleName) {
        log.info("Updating role for user with ID: {} to role: {}", id, roleName);
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Kiểm tra xem role có tồn tại không với roleName là đối tượng Role
        Role role = roleRepository.findById(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        user.setRole(role);
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

}
