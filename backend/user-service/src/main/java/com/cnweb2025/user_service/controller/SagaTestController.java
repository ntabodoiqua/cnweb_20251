package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.response.FileUploadResponse;
import com.cnweb2025.user_service.entity.UserFileMetadata;
import com.cnweb2025.user_service.saga.FileUploadSagaOrchestrator;
import com.cnweb2025.user_service.service.UserFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Test Controller cho Saga Rollback Testing
 * Endpoint này chỉ dùng cho testing và development
 * NÊN TẮT trong production environment
 */
@RestController
@RequestMapping("/api/test/saga")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Saga Testing", description = "API để test Saga rollback scenarios - CHỈ DÙNG CHO DEVELOPMENT")
public class SagaTestController {
    
    private final FileUploadSagaOrchestrator sagaOrchestrator;
    private final UserFileService userFileService;
    
    // Flag để simulate errors
    private static boolean simulateFileServiceError = false;
    private static boolean simulateDatabaseError = false;
    private static boolean simulateNetworkTimeout = false;
    
    /**
     * Test upload file bình thường (success scenario)
     */
    @PostMapping("/upload-success")
    @Operation(summary = "Test successful upload", description = "Upload file thành công - không có error")
    public ResponseEntity<FileUploadResponse> testSuccessfulUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", defaultValue = "test-user-123") String userId) {
        
        log.info("TEST: Testing successful upload for user: {}", userId);
        resetErrorFlags();
        
        FileUploadResponse response = sagaOrchestrator.executeFileUploadSaga(userId, file);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test scenario: FileService unavailable
     * Rollback: Xóa metadata đã tạo
     */
    @PostMapping("/test-fileservice-error")
    @Operation(summary = "Test FileService error", 
               description = "Simulate FileService unavailable - expect rollback of metadata")
    public ResponseEntity<Map<String, Object>> testFileServiceError(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", defaultValue = "test-user-123") String userId) {
        
        log.warn("TEST: Simulating FileService error for user: {}", userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("testScenario", "FileService Unavailable");
        result.put("expectedBehavior", "Should rollback metadata creation");
        
        try {
            // Set flag để FileServiceClient throw error
            simulateFileServiceError = true;
            
            FileUploadResponse response = sagaOrchestrator.executeFileUploadSaga(userId, file);
            
            result.put("uploadResponse", response);
            result.put("status", response.getStatus());
            result.put("rollbackExecuted", response.getStatus() == UserFileMetadata.UploadStatus.ROLLBACK);
            
            // Verify metadata đã được rollback
            List<UserFileMetadata> userFiles = userFileService.getUserFiles(userId);
            long failedOrRollback = userFiles.stream()
                .filter(f -> f.getUploadStatus() == UserFileMetadata.UploadStatus.ROLLBACK || 
                            f.getUploadStatus() == UserFileMetadata.UploadStatus.FAILED)
                .count();
            
            result.put("rollbackCount", failedOrRollback);
            result.put("message", "FileService error simulated successfully");
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("message", "Exception thrown as expected");
        } finally {
            resetErrorFlags();
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Test scenario: Database error khi update status
     * Rollback: Xóa file từ FileService + xóa metadata
     */
    @PostMapping("/test-database-error")
    @Operation(summary = "Test Database error", 
               description = "Simulate DB error during status update - expect full rollback")
    public ResponseEntity<Map<String, Object>> testDatabaseError(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", defaultValue = "test-user-123") String userId) {
        
        log.warn("TEST: Simulating Database error for user: {}", userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("testScenario", "Database Update Error");
        result.put("expectedBehavior", "Should rollback both file upload and metadata");
        
        try {
            simulateDatabaseError = true;
            
            FileUploadResponse response = sagaOrchestrator.executeFileUploadSaga(userId, file);
            
            result.put("uploadResponse", response);
            result.put("status", response.getStatus());
            result.put("rollbackExecuted", response.getStatus() != UserFileMetadata.UploadStatus.UPLOADED);
            result.put("message", "Database error simulated successfully");
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("message", "Exception thrown as expected");
        } finally {
            resetErrorFlags();
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get all files của user để verify rollback
     */
    @GetMapping("/user-files/{userId}")
    @Operation(summary = "Get user files", description = "Xem tất cả metadata của user để verify rollback")
    public ResponseEntity<Map<String, Object>> getUserFiles(@PathVariable String userId) {
        List<UserFileMetadata> files = userFileService.getUserFiles(userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("totalFiles", files.size());
        result.put("files", files);
        
        // Count by status
        Map<String, Long> statusCount = new HashMap<>();
        for (UserFileMetadata.UploadStatus status : UserFileMetadata.UploadStatus.values()) {
            long count = files.stream()
                .filter(f -> f.getUploadStatus() == status)
                .count();
            statusCount.put(status.name(), count);
        }
        result.put("statusCounts", statusCount);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Clean up tất cả test data
     */
    @DeleteMapping("/cleanup/{userId}")
    @Operation(summary = "Cleanup test data", description = "Xóa tất cả metadata của test user")
    public ResponseEntity<Map<String, Object>> cleanupTestData(@PathVariable String userId) {
        log.info("TEST: Cleaning up test data for user: {}", userId);
        
        int deletedCount = userFileService.deleteAllUserFiles(userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("deletedCount", deletedCount);
        result.put("message", "Test data cleaned up successfully");
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get error simulation flags status
     */
    @GetMapping("/error-flags")
    @Operation(summary = "Get error flags", description = "Xem trạng thái của error simulation flags")
    public ResponseEntity<Map<String, Boolean>> getErrorFlags() {
        Map<String, Boolean> flags = new HashMap<>();
        flags.put("simulateFileServiceError", simulateFileServiceError);
        flags.put("simulateDatabaseError", simulateDatabaseError);
        flags.put("simulateNetworkTimeout", simulateNetworkTimeout);
        return ResponseEntity.ok(flags);
    }
    
    /**
     * Set error simulation flags
     */
    @PostMapping("/error-flags")
    @Operation(summary = "Set error flags", description = "Bật/tắt error simulation")
    public ResponseEntity<Map<String, Boolean>> setErrorFlags(
            @RequestParam(required = false) Boolean fileServiceError,
            @RequestParam(required = false) Boolean databaseError,
            @RequestParam(required = false) Boolean networkTimeout) {
        
        if (fileServiceError != null) simulateFileServiceError = fileServiceError;
        if (databaseError != null) simulateDatabaseError = databaseError;
        if (networkTimeout != null) simulateNetworkTimeout = networkTimeout;
        
        return getErrorFlags();
    }
    
    /**
     * Reset all error flags
     */
    @PostMapping("/reset-flags")
    @Operation(summary = "Reset error flags", description = "Reset tất cả error flags về false")
    public ResponseEntity<Map<String, Boolean>> resetFlags() {
        resetErrorFlags();
        return getErrorFlags();
    }
    
    // Getters cho error flags (để Saga orchestrator có thể check)
    public static boolean isSimulateFileServiceError() {
        return simulateFileServiceError;
    }
    
    public static boolean isSimulateDatabaseError() {
        return simulateDatabaseError;
    }
    
    public static boolean isSimulateNetworkTimeout() {
        return simulateNetworkTimeout;
    }
    
    private void resetErrorFlags() {
        simulateFileServiceError = false;
        simulateDatabaseError = false;
        simulateNetworkTimeout = false;
    }
}
