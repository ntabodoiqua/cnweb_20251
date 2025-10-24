package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.response.LoginHistoryResponse;
import com.cnweb2025.user_service.service.LoginHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login-history")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoginHistoryController {
    LoginHistoryService loginHistoryService;

    // Lấy lịch sử đăng nhập của người dùng theo username
    @GetMapping("/{userName}")
    public ApiResponse<Page<LoginHistoryResponse>> getLoginHistoryByUserId(
            @PathVariable String userName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "loginTime") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        log.info("REST request to get login history for userId: {}", userName);
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ApiResponse.<Page<LoginHistoryResponse>>builder()
                .message("Fetched login history successfully")
                .result(loginHistoryService.getLoginHistoryByUserId(userName, pageable))
                .build();
    }
}
