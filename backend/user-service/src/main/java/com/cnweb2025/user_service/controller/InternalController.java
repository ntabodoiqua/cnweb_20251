package com.cnweb2025.user_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.cnweb2025.user_service.dto.response.UserInfoSimpleResponse;
import com.cnweb2025.user_service.service.FileReferenceService;
import com.cnweb2025.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Internal Controller để xử lý các request từ các services khác
 * Không cần authentication vì chỉ dùng internal (service-to-service)
 */
@RestController
@RequestMapping("/users/internal")
@RequiredArgsConstructor
@Slf4j
public class InternalController {

    private final FileReferenceService fileReferenceService;
    private final UserService userService;

    /**
     * API internal để kiểm tra xem các file có còn được tham chiếu không
     * Được gọi từ file-service để cleanup orphan files
     * 
     * @param fileNames Danh sách file names cần kiểm tra
     * @return Set các file name còn được tham chiếu trong User Service
     */
    @PostMapping("/check-file-references")
    public ApiResponse<Set<String>> checkFileReferences(@RequestBody List<String> fileNames) {
        log.debug("Checking file references for {} files", fileNames.size());
        
        Set<String> referencedFiles = fileReferenceService.findReferencedFiles(fileNames);
        
        log.debug("Found {} referenced files out of {}", referencedFiles.size(), fileNames.size());
        
        return ApiResponse.<Set<String>>builder()
                .result(referencedFiles)
                .message("File references checked successfully")
                .build();
    }

    /**
     * API internal để lấy thông tin nhiều users theo danh sách usernames
     * Sử dụng cho việc hiển thị thông tin người dùng trong các service khác
     * 
     * @param usernames Danh sách usernames cần lấy thông tin
     * @return Map với key là username và value là thông tin user đơn giản
     */
    @PostMapping("/batch")
    public ApiResponse<Map<String, UserInfoSimpleResponse>> getUsersByUsernames(@RequestBody List<String> usernames) {
        log.debug("Getting user info for {} usernames", usernames.size());
        
        Map<String, UserInfoSimpleResponse> users = userService.getUsersByUsernames(usernames);
        
        log.debug("Found {} users out of {} requested", users.size(), usernames.size());
        
        return ApiResponse.<Map<String, UserInfoSimpleResponse>>builder()
                .result(users)
                .message("Users retrieved successfully")
                .build();
    }
}
