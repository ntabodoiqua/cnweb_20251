package com.vdt2025.file_service.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.file_service.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        ErrorCode errorcode = ErrorCode.UNAUTHENTICATED;
        response.setStatus(errorcode.getStatusCode().value());
        // Thiết lập kiểu dữ liệu trả về là JSON
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorcode.getCode())
                .message(errorcode.getMessage())
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        // Chuyển đổi ApiResponse thành JSON và ghi vào response
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer();
    }
}
