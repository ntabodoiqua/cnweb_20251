package com.vdt2025.file_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.file_service.service.FileCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller để quản lý file cleanup operations
 * Chỉ ADMIN mới có quyền sử dụng các API này
 */
@RestController
@RequestMapping("/files/cleanup")
@RequiredArgsConstructor
@Slf4j
public class FileCleanupController {

    private final FileCleanupService fileCleanupService;

    /**
     * API để trigger manual cleanup
     * Chỉ ADMIN mới có thể trigger
     */
    @PostMapping("/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> triggerCleanup() {
        log.info("Manual cleanup triggered via API");
        String result = fileCleanupService.triggerManualCleanup();
        
        return ApiResponse.<String>builder()
                .result(result)
                .message("Cleanup task triggered successfully")
                .build();
    }

    /**
     * API để xem thống kê orphan files
     * Chỉ ADMIN mới có thể xem
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getStatistics() {
        log.info("Getting orphan files statistics");
        Map<String, Object> stats = fileCleanupService.getOrphanFilesStatistics();
        
        return ApiResponse.<Map<String, Object>>builder()
                .result(stats)
                .message("Statistics retrieved successfully")
                .build();
    }
}
