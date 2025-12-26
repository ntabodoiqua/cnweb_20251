package com.cnweb2025.user_service.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter để xác thực internal service-to-service requests
 * Chỉ cho phép truy cập /users/internal/** nếu có header X-Internal-Request với secret key đúng
 */
@Component
@Order(1) // Chạy filter này trước SecurityFilterChain
@Slf4j
public class InternalRequestFilter extends OncePerRequestFilter {

    private static final String INTERNAL_HEADER = "X-Internal-Request";
    private static final String INTERNAL_PATH_PREFIX = "/users/internal/";

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Chỉ kiểm tra các request đến internal endpoints
        if (requestPath.startsWith(INTERNAL_PATH_PREFIX)) {
            String internalHeader = request.getHeader(INTERNAL_HEADER);

            // Kiểm tra header có tồn tại và có giá trị đúng không
            if (internalHeader == null || !internalHeader.equals(internalServiceSecret)) {
                log.warn("Unauthorized internal request attempt to: {} from IP: {}",
                        requestPath, request.getRemoteAddr());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"code\":1104,\"message\":\"Access to internal API is forbidden\"}");
                return;
            }

            log.debug("Valid internal request to: {}", requestPath);
        }

        filterChain.doFilter(request, response);
    }
}
