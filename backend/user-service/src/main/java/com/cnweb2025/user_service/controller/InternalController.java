package com.cnweb2025.user_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.cnweb2025.user_service.service.FileReferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
}
