package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.entity.LoginHistory;
import com.cnweb2025.user_service.enums.SigninStatus;
import com.cnweb2025.user_service.repository.LoginHistoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoginHistoryService {
    LoginHistoryRepository loginHistoryRepository;

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
}
