package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.request.auth.*;
import com.cnweb2025.user_service.enums.SigninStatus;
import com.cnweb2025.user_service.service.LoginHistoryService;
import com.nimbusds.jose.JOSEException;
import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.response.AuthenticationResponse;
import com.cnweb2025.user_service.dto.response.IntrospectResponse;
import com.cnweb2025.user_service.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    LoginHistoryService loginHistoryService;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        String userAgent = httpRequest.getHeader("User-Agent");
        try {
            var result = authenticationService.authenticate(request);
            loginHistoryService.recordLogin(request.getUsername(), ipAddress, userAgent, SigninStatus.SUCCESS);
            return ApiResponse.<AuthenticationResponse>builder()
                    .result(result)
                    .build();
        } catch (Exception e) {
            loginHistoryService.recordLogin(request.getUsername(), ipAddress, userAgent, SigninStatus.FAILED);
            throw e;
        }

    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .build();
    }

    @PostMapping("/google")
    ApiResponse<AuthenticationResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        String userAgent = httpRequest.getHeader("User-Agent");
        var result = authenticationService.authenticateWithGoogle(request.getToken());
        try {
            loginHistoryService.recordLogin(result.getUserId(), ipAddress, userAgent, SigninStatus.SUCCESS);
            return ApiResponse.<AuthenticationResponse>builder()
                    .result(result)
                    .build();
        } catch (Exception e) {
            loginHistoryService.recordLogin(result.getUserId(), ipAddress, userAgent, SigninStatus.FAILED);
            throw e;
        }
    }
}
