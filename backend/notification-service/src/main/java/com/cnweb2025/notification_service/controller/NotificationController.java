package com.cnweb2025.notification_service.controller;

import com.cnweb2025.notification_service.dto.NotificationDTO;
import com.cnweb2025.notification_service.service.NotificationService;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {
    
    NotificationService notificationService;
    
    /**
     * Lấy danh sách thông báo (có phân trang)
     */
    @GetMapping
    public ApiResponse<Page<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String userId = jwt.getSubject();
        Page<NotificationDTO> notifications = notificationService.getNotifications(userId, page, size);
        return ApiResponse.<Page<NotificationDTO>>builder()
                .result(notifications)
                .build();
    }
    
    /**
     * Lấy 10 thông báo gần nhất
     */
    @GetMapping("/recent")
    public ApiResponse<List<NotificationDTO>> getRecentNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        List<NotificationDTO> notifications = notificationService.getRecentNotifications(userId);
        return ApiResponse.<List<NotificationDTO>>builder()
                .result(notifications)
                .build();
    }
    
    /**
     * Lấy danh sách thông báo chưa đọc
     */
    @GetMapping("/unread")
    public ApiResponse<List<NotificationDTO>> getUnreadNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ApiResponse.<List<NotificationDTO>>builder()
                .result(notifications)
                .build();
    }
    
    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread/count")
    public ApiResponse<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        long count = notificationService.getUnreadCount(userId);
        return ApiResponse.<Map<String, Long>>builder()
                .result(Map.of("count", count))
                .build();
    }
    
    /**
     * Đánh dấu một thông báo đã đọc
     */
    @PatchMapping("/{notificationId}/read")
    public ApiResponse<Map<String, Boolean>> markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String notificationId
    ) {
        String userId = jwt.getSubject();
        boolean success = notificationService.markAsRead(notificationId, userId);
        return ApiResponse.<Map<String, Boolean>>builder()
                .result(Map.of("success", success))
                .build();
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @PatchMapping("/read-all")
    public ApiResponse<Map<String, Integer>> markAllAsRead(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        int updated = notificationService.markAllAsRead(userId);
        return ApiResponse.<Map<String, Integer>>builder()
                .result(Map.of("updated", updated))
                .build();
    }
}
