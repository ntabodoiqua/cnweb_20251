package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.response.LoginHistoryResponse;
import com.cnweb2025.user_service.entity.LoginHistory;
import com.cnweb2025.user_service.enums.SigninStatus;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.LoginHistoryMapper;
import com.cnweb2025.user_service.repository.LoginHistoryRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoginHistoryService {
    LoginHistoryRepository loginHistoryRepository;
    LoginHistoryMapper loginHistoryMapper;
    UserRepository userRepository;

    @Async
    public void recordLogin(String userId, String ipAddress, String userAgent, SigninStatus status) {
        log.info("Recording login for user: {}", userId);
        LoginHistory loginHistory = new LoginHistory();
        loginHistory.setUserId(userId);
        loginHistory.setIpAddress(ipAddress);
        loginHistory.setUserAgent(userAgent);
        loginHistory.setLoginTime(LocalDateTime.now());
        loginHistory.setStatus(status);
        loginHistoryRepository.save(loginHistory);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public Page<LoginHistoryResponse> getLoginHistoryByUserId(String userId, Pageable pageable) {
        log.info("Fetching login history for user: {}", userId);
        // Kiểm tra xem userName có tồn tại không
        userRepository.findByUsername(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return loginHistoryRepository.findByUserId(userId, pageable)
                .map(loginHistoryMapper::toResponse);
    }

    @Transactional
    public Page<LoginHistoryResponse> getMyLoginHistory(Pageable pageable) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        log.info("Fetching login history for current user: {}", username);
        return loginHistoryRepository.findByUserId(username, pageable)
                .map(loginHistoryMapper::toResponse);
    }
}
