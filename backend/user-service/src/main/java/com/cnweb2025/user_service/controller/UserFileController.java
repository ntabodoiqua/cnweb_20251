package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.response.FileUploadResponse;
import com.cnweb2025.user_service.saga.FileUploadSagaOrchestrator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST Controller cho file upload với Saga pattern
 * Nhận request từ client và orchestrate toàn bộ quá trình upload
 */
@RestController
@RequestMapping("/api/users/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User File Upload", description = "API cho upload file của user với Saga pattern")
public class UserFileController {
    
    private final FileUploadSagaOrchestrator sagaOrchestrator;
    
    /**
     * Upload file với Saga orchestration
     * 
     * Endpoint nhận multipart/form-data từ client và thực hiện:
     * 1. Validate file
     * 2. Tạo metadata trong DB (Step 1)
     * 3. Upload file đến FileService (Step 2)
     * 4. Cập nhật trạng thái (Step 3)
     * 5. Nếu có lỗi ở bất kỳ step nào → rollback
     * 
     * @param file File được upload từ client
     * @param authentication Authentication context (lấy userId)
     * @return Response chứa thông tin file và trạng thái
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file với Saga pattern", 
               description = "Upload file qua FileService với automatic rollback nếu có lỗi")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        log.info("Received file upload request: {}", file.getOriginalFilename());
        
        try {
            // Validate file
            validateFile(file);
            
            // Lấy userId từ authentication
            String userId = authentication.getName();
            log.info("User ID: {}", userId);
            
            // Execute Saga
            FileUploadResponse response = sagaOrchestrator.executeFileUploadSaga(userId, file);
            
            // Kiểm tra kết quả
            if (response.getStatus() == com.cnweb2025.user_service.entity.UserFileMetadata.UploadStatus.UPLOADED) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (FileValidationException e) {
            log.error("File validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(FileUploadResponse.builder()
                    .message("File validation failed: " + e.getMessage())
                    .build());
                    
        } catch (Exception e) {
            log.error("Unexpected error during file upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(FileUploadResponse.builder()
                    .message("Internal server error: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Validate file trước khi upload
     * - Check file không null và không rỗng
     * - Check file size (max 10MB)
     * - Check file type (chỉ cho phép một số loại)
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("File is empty or null");
        }
        
        // Max file size: 10MB
        long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxFileSize) {
            throw new FileValidationException(
                String.format("File size exceeds maximum allowed size of %d bytes", maxFileSize)
            );
        }
        
        // Allowed file types
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedContentType(contentType)) {
            throw new FileValidationException(
                "File type not allowed. Allowed types: images, PDF, documents"
            );
        }
        
        log.debug("File validation passed for: {}", file.getOriginalFilename());
    }
    
    /**
     * Kiểm tra content type được phép
     */
    private boolean isAllowedContentType(String contentType) {
        return contentType.startsWith("image/") ||
               contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("application/vnd.ms-excel") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }
    
    /**
     * Exception cho file validation errors
     */
    public static class FileValidationException extends RuntimeException {
        public FileValidationException(String message) {
            super(message);
        }
    }
}
