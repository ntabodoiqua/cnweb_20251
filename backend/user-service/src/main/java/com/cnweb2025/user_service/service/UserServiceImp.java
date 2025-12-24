package com.cnweb2025.user_service.service;

import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserCreatedEvent;
import com.vdt2025.common_dto.dto.UserForgotPasswordEvent;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.cnweb2025.user_service.constant.PredefinedRole;
import com.cnweb2025.user_service.dto.request.user.UserCreationRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.UserInfoSimpleResponse;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.entity.Role;
import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.enums.OtpType;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.UserMapper;
import com.cnweb2025.user_service.repository.RoleRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.messaging.RabbitMQMessagePublisher;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImp implements UserService{
    RoleRepository roleRepository;
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    FileServiceClient fileServiceClient;
    RabbitMQMessagePublisher messagePublisher;
    OtpService otpService;
    // FileStorageService fileStorageService;

    @Override
    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Gán role mặc định
        Set<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE)
                .ifPresent(roles::add);
        user.setRoles(roles);
        // Gán trạng thái kích hoạt cho người dùng
        user.setEnabled(true);
        // Đặt trạng thái chưa xác thực email
        user.setVerified(false);
        // Lưu người dùng vào cơ sở dữ liệu
        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        
        // Tạo OTP code cho việc xác thực email
        String otpCode = otpService.createOtpCode(user.getId(), OtpType.EMAIL_VERIFICATION);
        log.info("OTP code created for user: {}", user.getUsername());
        
        com.vdt2025.common_dto.dto.UserCreatedEvent event = UserCreatedEvent.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .otpCode(otpCode)
                .build();
        messagePublisher.publish(MessageType.USER_CREATED, event);
        log.info("User {} created successfully with ID {}", user.getUsername(), user.getId());
        return userMapper.toUserResponse(user);
    }

    @Override
    @Cacheable(value = "userCache",
            key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public UserResponse getMyInfo() {
        log.info("Fetching current user information");
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        var context = SecurityContextHolder.getContext();
        // Lấy tên người dùng từ Authentication
        String username = context.getAuthentication().getName();
        // Tìm người dùng trong cơ sở dữ liệu
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Cacheable(value = "userCache", key = "#username")
    public UserResponse getUserByUsername(String username) {
        log.info("Fetching user information for username: {}", username);
        // Tìm người dùng theo tên đăng nhập
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'SELLER')")
    public String changeMyPassword(String oldPassword, String newPassword) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }
        // Kiểm tra mật khẩu mới phải khác mật khẩu cũ
        if (oldPassword.equals(newPassword)) {
            throw new AppException(ErrorCode.OLD_PASSWORD_SAME_AS_NEW);
        }
        // Mã hóa mật khẩu mới và lưu vào cơ sở dữ liệu
        user.setPassword(passwordEncoder.encode(newPassword));
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        log.info("User {} changed password successfully", username);
        return "Password changed successfully";
    }

    @Override
    @Transactional
    @CacheEvict(value = "userCache",
            key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public String setMyAvatar(MultipartFile file) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        FileInfoResponse response = fileServiceClient.uploadPublicFile(file).getResult();
        user.setAvatarUrl(response.getFileUrl());
        user.setAvatarName(response.getFileName());
        userRepository.save(user);
        return response.getFileUrl();
    }


    @Override
    @CacheEvict(value = "userCache",
            key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'SELLER')")
    public UserResponse updateMyInfo(UserUpdateRequest request) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Cập nhật thông tin người dùng từ request
        // Với các trường hợp không có trong request, sẽ giữ nguyên giá trị cũ
        // Người dùng không tự cập nhật role, chỉ có admin mới có thể cập nhật vai trò
        userMapper.updateUser(user, request);
        // Lưu người dùng đã cập nhật vào cơ sở dữ liệu

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        log.info("User {} updated their information successfully", username);
        return userMapper.toUserResponse(user);
    }

    @Override
    @CacheEvict(value = "userCache",
            key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public String disableMyAccount() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Đặt trạng thái người dùng là không hoạt động
        user.setEnabled(false);
        userRepository.save(user);

        // Gửi sự kiện USER_DISABLED qua RabbitMQ
        com.vdt2025.common_dto.dto.UserDisabledEvent event = com.vdt2025.common_dto.dto.UserDisabledEvent.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
        messagePublisher.publish(MessageType.USER_DISABLED, event);

        log.info("User {} disabled their account successfully", username);
        return "Account disabled successfully";
    }

    @Override
    public String verifyEmail(String username, String otpCode) {
        log.info("Verifying email for user: {}", username);
        
        // Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Kiểm tra xem user đã được xác thực chưa
        if (user.isVerified()) {
            log.warn("User {} already verified", username);
            return "Email already verified";
        }
        
        // Xác thực OTP code
        otpService.verifyOtpCode(user.getId(), otpCode, OtpType.EMAIL_VERIFICATION);
        
        // Cập nhật trạng thái xác thực
        user.setVerified(true);
        userRepository.save(user);
        
        log.info("User {} verified their email successfully", username);
        return "Email verified successfully";
    }

    @Override
    public String resendOtp(String username) {
        log.info("Resending OTP for user: {}", username);
        
        // Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Kiểm tra xem user đã được xác thực chưa
        if (user.isVerified()) {
            log.warn("User {} already verified", username);
            return "Email already verified";
        }
        
        // Tạo OTP code mới
        String otpCode = otpService.createOtpCode(user.getId(), OtpType.EMAIL_VERIFICATION);
        
        // Gửi OTP qua RabbitMQ
        UserCreatedEvent event = UserCreatedEvent.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .otpCode(otpCode)
                .build();
        messagePublisher.publish(MessageType.EMAIL_VERIFICATION, event);
        
        log.info("OTP resent for user: {}", username);
        return "OTP code has been resent to your email";
    }

    @Override
    public String forgotPassword(String username) {
        log.info("Processing forgot password for user: {}", username);

        // Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tạo OTP code cho việc đặt lại mật khẩu
        String otpCode = otpService.createOtpCode(user.getId(), OtpType.PASSWORD_RESET);

        // Gửi OTP qua RabbitMQ
        UserForgotPasswordEvent event = UserForgotPasswordEvent.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .otpCode(otpCode)
                .build();
        messagePublisher.publish(MessageType.PASSWORD_RESET, event);

        log.info("Forgot password OTP sent for user: {}", username);
        return "Password reset OTP has been sent to your email";
    }

    @Override
    public String resetPassword(String username, String otpCode, String newPassword) {
        log.info("Resetting password for user: {}", username);

        // Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Xác thực OTP code
        otpService.verifyOtpCode(user.getId(), otpCode, OtpType.PASSWORD_RESET);

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", username);
        return "Password has been reset successfully";
    }

    public String getMyAvatarLink() {
        log.info("Fetching avatar link for current user");
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return user.getAvatarName();
    }

    @Override
    @Transactional
    public User findOrCreateGoogleUser(String email, String name, String picture) {
        log.info("Finding or creating Google user with email: {}", email);

        // Tìm user theo email
        var existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Kiểm tra xem user có bị vô hiệu hóa không
            if (!user.isEnabled()) {
                log.warn("User {} is disabled and cannot login via Google", email);
                throw new AppException(ErrorCode.USER_DISABLED);
            }

            // Nếu user chưa verify, tự động verify qua Google
            if (!user.isVerified()) {
                user.setVerified(true);
                log.info("Verified existing user {} via Google login", email);
            }

            // Cập nhật avatar nếu có và chưa có avatar
            if (picture != null && !picture.isEmpty() &&
                    (user.getAvatarName() == null || user.getAvatarName().isEmpty())
                    && (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty())) {
                user.setAvatarName(picture);
                user.setAvatarUrl(picture);
            }

            return userRepository.save(user);
        }

        // Tạo user mới nếu chưa tồn tại
        User newUser = new User();
        newUser.setUsername(email); // Sử dụng email làm username
        newUser.setEmail(email);
        newUser.setFullName(name != null ? name : email.split("@")[0]);
        newUser.setAvatarName(picture);
        newUser.setVerified(true); // Google đã verify email
        newUser.setEnabled(true);

        // Tạo password ngẫu nhiên vì user đăng nhập bằng Google
        String randomPassword = java.util.UUID.randomUUID().toString();
        newUser.setPassword(passwordEncoder.encode(randomPassword));

        // Gán role USER mặc định
        Role userRole = roleRepository.findByName(PredefinedRole.USER_ROLE)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        newUser.setRoles(roles);

        try {
            User savedUser = userRepository.save(newUser);
            // gửi email chào mừng
            com.vdt2025.common_dto.dto.UserCreatedEvent event = UserCreatedEvent.builder()
                    .id(savedUser.getId())
                    .username(savedUser.getUsername())
                    .email(savedUser.getEmail())
                    .otpCode(null)
                    .build();
            messagePublisher.publish(MessageType.USER_CREATED, event);
            log.info("Created new user {} from Google login", email);
            return savedUser;
        } catch (DataIntegrityViolationException e) {
            log.error("Error creating user from Google login: {}", e.getMessage());
            throw new AppException(ErrorCode.USER_EXISTED);
        }
    }

    @Override
    public Map<String, UserInfoSimpleResponse> getUsersByUsernames(List<String> usernames) {
        log.info("Getting user info for {} usernames", usernames.size());
        
        if (usernames == null || usernames.isEmpty()) {
            return Map.of();
        }
        
        List<User> users = userRepository.findByUsernameIn(usernames);
        
        return users.stream()
                .collect(java.util.stream.Collectors.toMap(
                        User::getUsername,
                        user -> UserInfoSimpleResponse.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .avatarUrl(user.getAvatarUrl())
                                .build(),
                        (existing, replacement) -> existing
                ));
    }

}
