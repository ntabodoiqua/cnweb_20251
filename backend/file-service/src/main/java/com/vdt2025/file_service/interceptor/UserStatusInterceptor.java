package com.vdt2025.file_service.interceptor;

import com.vdt2025.common_dto.dto.response.UserResponse;
import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.file_service.exception.AppException;
import com.vdt2025.file_service.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class UserStatusInterceptor implements HandlerInterceptor {
    UserServiceClient userServiceClient;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Skip checks if user is not authenticated, is an admin, or is anonymous
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream()
                        .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                                || authority.getAuthority().equals("ROLE_ANONYMOUS"))) {
            return true;
        }

        // For regular authenticated users, check if their account is enabled
        String username = authentication.getName();
        UserResponse user = userServiceClient.getUserByUsername(username).getResult();

        if (!user.isEnabled()) {
            throw new AppException(ErrorCode.USER_DISABLED);
        }

        return true;
    }
}
