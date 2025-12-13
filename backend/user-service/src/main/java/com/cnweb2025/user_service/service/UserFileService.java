package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.response.FileUploadResponse;
import com.cnweb2025.user_service.entity.UserFileMetadata;
import com.cnweb2025.user_service.repository.UserFileMetadataRepository;
import com.cnweb2025.user_service.saga.FileUploadSagaOrchestrator;
import com.cnweb2025.user_service.saga.EnhancedFileUploadSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

/**
 * Service layer cho quản lý file uploads của user
 * Sử dụng Saga orchestrator để handle upload logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserFileService {
    
    private final FileUploadSagaOrchestrator sagaOrchestrator;
    private final EnhancedFileUploadSagaOrchestrator enhancedSagaOrchestrator;
    private final UserFileMetadataRepository metadataRepository;
    
    /**
     * Upload file cho user - sử dụng basic Saga
     * 
     * @param userId ID của user
     * @param file File cần upload
     * @return Response chứa thông tin file
     */
    public FileUploadResponse uploadFile(String userId, MultipartFile file) {
        log.info("Uploading file for user: {} - {}", userId, file.getOriginalFilename());
        return sagaOrchestrator.executeFileUploadSaga(userId, file);
    }
    
    /**
     * Upload file cho user - sử dụng Enhanced Saga với retry
     * Recommended cho production environment
     * 
     * @param userId ID của user
     * @param file File cần upload
     * @return Response chứa thông tin file
     */
    public FileUploadResponse uploadFileWithRetry(String userId, MultipartFile file) {
        log.info("Uploading file with retry for user: {} - {}", userId, file.getOriginalFilename());
        return enhancedSagaOrchestrator.executeFileUploadSagaWithRetry(userId, file);
    }
    
    /**
     * Lấy danh sách file của user
     * 
     * @param userId ID của user
     * @return List các metadata
     */
    @Transactional(readOnly = true)
    public List<UserFileMetadata> getUserFiles(String userId) {
        log.debug("Getting files for user: {}", userId);
        return metadataRepository.findByUserId(userId);
    }
    
    /**
     * Lấy file theo ID
     * 
     * @param fileId ID của file
     * @param userId ID của user (để verify ownership)
     * @return Optional metadata
     */
    @Transactional(readOnly = true)
    public Optional<UserFileMetadata> getFileById(Long fileId, String userId) {
        log.debug("Getting file {} for user: {}", fileId, userId);
        return metadataRepository.findByIdAndUserId(fileId, userId);
    }
    
    /**
     * Lấy danh sách file theo trạng thái
     * Useful cho monitoring và cleanup
     * 
     * @param status Upload status
     * @return List các metadata
     */
    @Transactional(readOnly = true)
    public List<UserFileMetadata> getFilesByStatus(UserFileMetadata.UploadStatus status) {
        log.debug("Getting files with status: {}", status);
        return metadataRepository.findByUploadStatus(status);
    }
    
    /**
     * Cleanup failed uploads
     * Nên chạy định kỳ để cleanup các metadata ở trạng thái FAILED/ROLLBACK
     * 
     * @return Số lượng records đã xóa
     */
    @Transactional
    public int cleanupFailedUploads() {
        log.info("Starting cleanup of failed uploads");
        
        List<UserFileMetadata> failedUploads = metadataRepository.findByUploadStatus(
            UserFileMetadata.UploadStatus.FAILED
        );
        
        List<UserFileMetadata> rollbackUploads = metadataRepository.findByUploadStatus(
            UserFileMetadata.UploadStatus.ROLLBACK
        );
        
        int count = failedUploads.size() + rollbackUploads.size();
        
        metadataRepository.deleteAll(failedUploads);
        metadataRepository.deleteAll(rollbackUploads);
        
        log.info("Cleaned up {} failed/rollback uploads", count);
        return count;
    }
    
    /**
     * Delete all files của một user
     * Dùng cho testing cleanup
     * 
     * @param userId ID của user
     * @return Số lượng files đã xóa
     */
    @Transactional
    public int deleteAllUserFiles(String userId) {
        log.info("Deleting all files for user: {}", userId);
        
        List<UserFileMetadata> userFiles = metadataRepository.findByUserId(userId);
        int count = userFiles.size();
        
        metadataRepository.deleteAll(userFiles);
        
        log.info("Deleted {} files for user: {}", count, userId);
        return count;
    }
}
