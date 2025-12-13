package com.cnweb2025.user_service.saga;

import com.cnweb2025.user_service.client.FileServiceClient;
import com.cnweb2025.user_service.dto.response.FileUploadResponse;
import com.cnweb2025.user_service.entity.UserFileMetadata;
import com.cnweb2025.user_service.repository.UserFileMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Enhanced Saga Orchestrator với retry mechanism
 * Version nâng cao với retry cho từng step
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnhancedFileUploadSagaOrchestrator {
    
    private final UserFileMetadataRepository metadataRepository;
    private final FileServiceClient fileServiceClient;
    private final SagaRetryManager retryManager;
    
    /**
     * Execute Saga với retry cho mỗi step
     */
    public FileUploadResponse executeFileUploadSagaWithRetry(String userId, MultipartFile file) {
        log.info("Starting enhanced file upload saga with retry for user: {}", userId);
        
        UserFileMetadata metadata = null;
        String uploadedFileName = null;
        
        try {
            // Step 1 với retry
            metadata = retryManager.executeWithRetryAndRecovery(
                () -> createUserMetadata(userId, file),
                "CreateUserMetadata",
                null // No recovery - if this fails, whole saga fails
            );
            log.info("Step 1 completed with retry: Metadata created with ID: {}", metadata.getId());
            
            // Step 2 với retry
            final UserFileMetadata finalMetadata = metadata;
            uploadedFileName = retryManager.executeWithRetryAndRecovery(
                () -> uploadFileToFileService(finalMetadata, file),
                "UploadFileToFileService",
                null // No automatic recovery - rollback handled by saga
            );
            log.info("Step 2 completed with retry: File uploaded: {}", uploadedFileName);
            
            // Step 3 với retry
            final String finalUploadedFileName = uploadedFileName;
            retryManager.executeWithRetryAndRecovery(
                () -> {
                    updateUserFileStatus(finalMetadata, finalUploadedFileName);
                    return null;
                },
                "UpdateUserFileStatus",
                null
            );
            log.info("Step 3 completed with retry: Status updated to UPLOADED");
            
            return buildSuccessResponse(metadata);
            
        } catch (Exception e) {
            log.error("Enhanced saga failed after retries, executing rollback. Error: {}", e.getMessage(), e);
            executeRollbackWithRetry(metadata, uploadedFileName, e);
            return buildFailureResponse(metadata, e);
        }
    }
    
    @Transactional
    protected UserFileMetadata createUserMetadata(String userId, MultipartFile file) {
        log.debug("Creating user file metadata for user: {}", userId);
        
        UserFileMetadata metadata = UserFileMetadata.builder()
            .userId(userId)
            .originalFileName(file.getOriginalFilename())
            .fileSize(file.getSize())
            .fileType(file.getContentType())
            .uploadStatus(UserFileMetadata.UploadStatus.PENDING)
            .build();
        
        return metadataRepository.save(metadata);
    }
    
    @Transactional
    protected String uploadFileToFileService(UserFileMetadata metadata, MultipartFile file) {
        log.debug("Uploading file to FileService: {}", metadata.getOriginalFileName());
        
        metadata.setUploadStatus(UserFileMetadata.UploadStatus.UPLOADING);
        metadataRepository.save(metadata);
        
        ResponseEntity<FileServiceClient.FileServiceResponse> response = 
            fileServiceClient.uploadFile(file);
        
        if (response.getBody() == null) {
            throw new RuntimeException("FileService returned empty response");
        }
        
        FileServiceClient.FileServiceResponse fileResponse = response.getBody();
        metadata.setFileName(fileResponse.fileName());
        metadata.setFileUrl(fileResponse.fileUrl());
        metadataRepository.save(metadata);
        
        return fileResponse.fileName();
    }
    
    @Transactional
    protected void updateUserFileStatus(UserFileMetadata metadata, String uploadedFileName) {
        log.debug("Updating file status to UPLOADED for: {}", uploadedFileName);
        metadata.setUploadStatus(UserFileMetadata.UploadStatus.UPLOADED);
        metadataRepository.save(metadata);
    }
    
    /**
     * Rollback với retry - đảm bảo rollback được thực hiện thành công
     */
    protected void executeRollbackWithRetry(UserFileMetadata metadata, String uploadedFileName, Exception originalError) {
        log.warn("Executing rollback with retry for saga");
        
        // Rollback Step 2: Xóa file với retry
        if (uploadedFileName != null) {
            try {
                retryManager.executeWithRetryAndRecovery(
                    () -> {
                        log.info("Rollback Step 2: Deleting file from FileService: {}", uploadedFileName);
                        fileServiceClient.deleteFile(uploadedFileName);
                        return null;
                    },
                    "RollbackDeleteFile",
                    () -> {
                        log.error("Failed to delete file even after retries: {}", uploadedFileName);
                        // Log để manual intervention
                        return null;
                    }
                );
            } catch (Exception e) {
                log.error("Critical: Failed to delete file during rollback: {}", e.getMessage());
            }
        }
        
        // Rollback Step 1: Mark metadata as rollback với retry
        if (metadata != null) {
            try {
                retryManager.executeWithRetryAndRecovery(
                    () -> {
                        log.info("Rollback Step 1: Marking metadata as ROLLBACK");
                        metadata.setUploadStatus(UserFileMetadata.UploadStatus.ROLLBACK);
                        metadata.setErrorMessage("Rollback: " + originalError.getMessage());
                        metadataRepository.save(metadata);
                        return null;
                    },
                    "RollbackUpdateMetadata",
                    () -> {
                        log.error("Failed to update metadata during rollback");
                        return null;
                    }
                );
            } catch (Exception e) {
                log.error("Critical: Failed to rollback metadata: {}", e.getMessage());
            }
        }
    }
    
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
            .message("File uploaded successfully with retry protection")
            .build();
    }
    
    private FileUploadResponse buildFailureResponse(UserFileMetadata metadata, Exception error) {
        return FileUploadResponse.builder()
            .id(metadata != null ? metadata.getId() : null)
            .userId(metadata != null ? metadata.getUserId() : null)
            .status(metadata != null ? metadata.getUploadStatus() : UserFileMetadata.UploadStatus.FAILED)
            .message("File upload failed after retries: " + error.getMessage())
            .build();
    }
}
