package com.cnweb2025.user_service.saga;

import com.cnweb2025.user_service.client.FileServiceClient;
import com.cnweb2025.user_service.client.FileServiceClientConfig;
import com.cnweb2025.user_service.dto.response.FileUploadResponse;
import com.cnweb2025.user_service.entity.UserFileMetadata;
import com.cnweb2025.user_service.repository.UserFileMetadataRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Saga Orchestrator cho file upload workflow
 * Implements orchestration-based saga pattern với các bước:
 * 1. createUserMetadata() - Tạo metadata trong DB
 * 2. uploadFileToFileService() - Upload file đến FileService
 * 3. updateUserFileStatus() - Cập nhật trạng thái thành công
 * 
 * Mỗi bước có compensating transaction tương ứng để rollback khi có lỗi
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadSagaOrchestrator {
    
    private final UserFileMetadataRepository metadataRepository;
    private final FileServiceClient fileServiceClient;
    
    /**
     * Orchestrate toàn bộ quá trình upload file với Saga pattern
     * 
     * @param userId ID của user
     * @param file File cần upload
     * @return Response chứa thông tin file và trạng thái
     */
    public FileUploadResponse executeFileUploadSaga(String userId, MultipartFile file) {
        log.info("Starting file upload saga for user: {}", userId);
        
        UserFileMetadata metadata = null;
        String uploadedFileName = null;
        
        try {
            // Step 1: Create metadata
            metadata = createUserMetadata(userId, file);
            log.info("Step 1 completed: Metadata created with ID: {}", metadata.getId());
            
            // Step 2: Upload file to FileService
            uploadedFileName = uploadFileToFileService(metadata, file);
            log.info("Step 2 completed: File uploaded successfully: {}", uploadedFileName);
            
            // Step 3: Update status to UPLOADED
            updateUserFileStatus(metadata, uploadedFileName);
            log.info("Step 3 completed: Status updated to UPLOADED");
            
            return buildSuccessResponse(metadata);
            
        } catch (Exception e) {
            log.error("Saga failed, executing rollback. Error: {}", e.getMessage(), e);
            
            // Rollback logic
            executeRollback(metadata, uploadedFileName, e);
            
            return buildFailureResponse(metadata, e);
        }
    }
    
    /**
     * Step 1: Tạo metadata trong database
     * Trạng thái ban đầu: PENDING
     */
    @Transactional
    protected UserFileMetadata createUserMetadata(String userId, MultipartFile file) {
        log.debug("Creating user file metadata for user: {}", userId);
        
        try {
            UserFileMetadata metadata = UserFileMetadata.builder()
                .userId(userId)
                .originalFileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .uploadStatus(UserFileMetadata.UploadStatus.PENDING)
                .build();
            
            return metadataRepository.save(metadata);
            
        } catch (Exception e) {
            log.error("Failed to create metadata", e);
            throw new SagaException("Step 1 failed: Cannot create metadata", e);
        }
    }
    
    /**
     * Step 2: Upload file đến FileService
     * Cập nhật trạng thái thành UPLOADING
     * 
     * @return Tên file đã upload (để dùng cho rollback nếu cần)
     */
    @Transactional
    protected String uploadFileToFileService(UserFileMetadata metadata, MultipartFile file) {
        log.debug("Uploading file to FileService: {}", metadata.getOriginalFileName());
        
        try {
            // Cập nhật trạng thái thành UPLOADING
            metadata.setUploadStatus(UserFileMetadata.UploadStatus.UPLOADING);
            metadataRepository.save(metadata);
            
            // Gọi FileService để upload
            ResponseEntity<FileServiceClient.FileServiceResponse> response = 
                fileServiceClient.uploadFile(file);
            
            if (response.getBody() == null) {
                throw new SagaException("Step 2 failed: FileService returned empty response");
            }
            
            FileServiceClient.FileServiceResponse fileResponse = response.getBody();
            
            // Lưu thông tin file từ FileService
            metadata.setFileName(fileResponse.fileName());
            metadata.setFileUrl(fileResponse.fileUrl());
            metadataRepository.save(metadata);
            
            return fileResponse.fileName();
            
        } catch (FeignException e) {
            log.error("FileService call failed: {}", e.getMessage());
            metadata.setUploadStatus(UserFileMetadata.UploadStatus.FAILED);
            metadata.setErrorMessage("FileService error: " + e.getMessage());
            metadataRepository.save(metadata);
            throw new SagaException("Step 2 failed: FileService error", e);
            
        } catch (Exception e) {
            log.error("Upload failed", e);
            metadata.setUploadStatus(UserFileMetadata.UploadStatus.FAILED);
            metadata.setErrorMessage(e.getMessage());
            metadataRepository.save(metadata);
            throw new SagaException("Step 2 failed: Upload error", e);
        }
    }
    
    /**
     * Step 3: Cập nhật trạng thái thành UPLOADED
     * Đây là bước cuối cùng của saga
     */
    @Transactional
    protected void updateUserFileStatus(UserFileMetadata metadata, String uploadedFileName) {
        log.debug("Updating file status to UPLOADED for: {}", uploadedFileName);
        
        try {
            metadata.setUploadStatus(UserFileMetadata.UploadStatus.UPLOADED);
            metadataRepository.save(metadata);
            
        } catch (Exception e) {
            log.error("Failed to update status", e);
            // Nếu step này fail, cần rollback file đã upload
            throw new SagaException("Step 3 failed: Cannot update status", e);
        }
    }
    
    /**
     * Rollback logic: Thực hiện compensating transactions
     * - Nếu đã upload file → xóa file từ FileService
     * - Nếu đã tạo metadata → xóa metadata hoặc đánh dấu ROLLBACK
     */
    @Transactional
    protected void executeRollback(UserFileMetadata metadata, String uploadedFileName, Exception originalError) {
        log.warn("Executing rollback for saga");
        
        // Rollback Step 2: Xóa file từ FileService nếu đã upload
        if (uploadedFileName != null) {
            try {
                log.info("Rollback Step 2: Deleting file from FileService: {}", uploadedFileName);
                fileServiceClient.deleteFile(uploadedFileName);
                log.info("File deleted successfully from FileService");
            } catch (Exception e) {
                log.error("Failed to delete file from FileService during rollback: {}", e.getMessage());
                // Log error nhưng tiếp tục rollback
            }
        }
        
        // Rollback Step 1: Xóa metadata hoặc đánh dấu rollback
        if (metadata != null) {
            try {
                log.info("Rollback Step 1: Marking metadata as ROLLBACK");
                metadata.setUploadStatus(UserFileMetadata.UploadStatus.ROLLBACK);
                metadata.setErrorMessage("Rollback: " + originalError.getMessage());
                metadataRepository.save(metadata);
                
                // Alternative: Có thể xóa hẳn metadata
                // metadataRepository.delete(metadata);
                
            } catch (Exception e) {
                log.error("Failed to rollback metadata: {}", e.getMessage());
            }
        }
    }
    
    /**
     * Build success response
     */
    private FileUploadResponse buildSuccessResponse(UserFileMetadata metadata) {
        return FileUploadResponse.builder()
            .id(metadata.getId())
            .userId(metadata.getUserId())
            .fileName(metadata.getFileName())
            .originalFileName(metadata.getOriginalFileName())
            .fileSize(metadata.getFileSize())
            .fileType(metadata.getFileType())
            .fileUrl(metadata.getFileUrl())
            .status(metadata.getUploadStatus())
            .message("File uploaded successfully")
            .build();
    }
    
    /**
     * Build failure response
     */
    private FileUploadResponse buildFailureResponse(UserFileMetadata metadata, Exception error) {
        return FileUploadResponse.builder()
            .id(metadata != null ? metadata.getId() : null)
            .userId(metadata != null ? metadata.getUserId() : null)
            .status(metadata != null ? metadata.getUploadStatus() : UserFileMetadata.UploadStatus.FAILED)
            .message("File upload failed: " + error.getMessage())
            .build();
    }
    
    /**
     * Custom exception cho Saga errors
     */
    public static class SagaException extends RuntimeException {
        public SagaException(String message) {
            super(message);
        }
        
        public SagaException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
