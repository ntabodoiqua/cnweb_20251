package com.cnweb2025.user_service.saga;

import com.cnweb2025.user_service.client.FileServiceClient;
import com.cnweb2025.user_service.dto.response.FileUploadResponse;
import com.cnweb2025.user_service.entity.UserFileMetadata;
import com.cnweb2025.user_service.repository.UserFileMetadataRepository;
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests cho FileUploadSagaOrchestrator
 * Test các scenario: success, rollback, retry
 */
@ExtendWith(MockitoExtension.class)
class FileUploadSagaOrchestratorTest {
    
    @Mock
    private UserFileMetadataRepository metadataRepository;
    
    @Mock
    private FileServiceClient fileServiceClient;
    
    @InjectMocks
    private FileUploadSagaOrchestrator sagaOrchestrator;
    
    private MultipartFile mockFile;
    private UserFileMetadata mockMetadata;
    
    @BeforeEach
    void setUp() {
        // Prepare mock file
        mockFile = new MockMultipartFile(
            "file",
            "test.jpg",
            "image/jpeg",
            "test content".getBytes()
        );
        
        // Prepare mock metadata
        mockMetadata = UserFileMetadata.builder()
            .id(1L)
            .userId("user-123")
            .originalFileName("test.jpg")
            .fileSize(12L)
            .fileType("image/jpeg")
            .uploadStatus(UserFileMetadata.UploadStatus.PENDING)
            .build();
    }
    
    @Test
    void testExecuteFileUploadSaga_Success() {
        // Given
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        FileServiceClient.FileServiceResponse fileServiceResponse = 
            new FileServiceClient.FileServiceResponse(
                "uploaded-test.jpg",
                "http://file-service/files/uploaded-test.jpg",
                12L,
                "image/jpeg",
                "Upload successful"
            );
        
        when(fileServiceClient.uploadFile(any(MultipartFile.class)))
            .thenReturn(ResponseEntity.ok(fileServiceResponse));
        
        // When
        FileUploadResponse response = sagaOrchestrator
            .executeFileUploadSaga("user-123", mockFile);
        
        // Then
        assertNotNull(response);
        assertEquals(UserFileMetadata.UploadStatus.UPLOADED, response.getStatus());
        assertEquals("File uploaded successfully", response.getMessage());
        assertEquals("uploaded-test.jpg", response.getFileName());
        
        // Verify steps executed
        verify(metadataRepository, times(3)).save(any(UserFileMetadata.class));
        verify(fileServiceClient, times(1)).uploadFile(any(MultipartFile.class));
        verify(fileServiceClient, never()).deleteFile(anyString());
    }
    
    @Test
    void testExecuteFileUploadSaga_RollbackOnFileServiceError() {
        // Given
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        // Mock FileService error
        Request mockRequest = Request.create(
            Request.HttpMethod.POST,
            "http://file-service/upload",
            new HashMap<>(),
            null,
            new RequestTemplate()
        );
        
        when(fileServiceClient.uploadFile(any(MultipartFile.class)))
            .thenThrow(new FeignException.ServiceUnavailable(
                "Service unavailable", 
                mockRequest, 
                null, 
                null
            ));
        
        // When
        FileUploadResponse response = sagaOrchestrator
            .executeFileUploadSaga("user-123", mockFile);
        
        // Then
        assertNotNull(response);
        assertNotEquals(UserFileMetadata.UploadStatus.UPLOADED, response.getStatus());
        assertTrue(response.getMessage().contains("failed"));
        
        // Verify rollback executed
        verify(metadataRepository, atLeast(2)).save(any(UserFileMetadata.class));
        verify(fileServiceClient, times(1)).uploadFile(any(MultipartFile.class));
        verify(fileServiceClient, never()).deleteFile(anyString()); // No file uploaded to delete
    }
    
    @Test
    void testExecuteFileUploadSaga_RollbackOnDatabaseError() {
        // Given
        UserFileMetadata savedMetadata = UserFileMetadata.builder()
            .id(1L)
            .userId("user-123")
            .originalFileName("test.jpg")
            .fileName("uploaded-test.jpg")
            .fileSize(12L)
            .fileType("image/jpeg")
            .uploadStatus(UserFileMetadata.UploadStatus.UPLOADING)
            .build();
        
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata)  // Step 1: OK
            .thenReturn(savedMetadata)  // Step 2: OK
            .thenThrow(new RuntimeException("Database error")); // Step 3: FAIL
        
        FileServiceClient.FileServiceResponse fileServiceResponse = 
            new FileServiceClient.FileServiceResponse(
                "uploaded-test.jpg",
                "http://file-service/files/uploaded-test.jpg",
                12L,
                "image/jpeg",
                "Upload successful"
            );
        
        when(fileServiceClient.uploadFile(any(MultipartFile.class)))
            .thenReturn(ResponseEntity.ok(fileServiceResponse));
        
        when(fileServiceClient.deleteFile(anyString()))
            .thenReturn(ResponseEntity.ok().build());
        
        // When
        FileUploadResponse response = sagaOrchestrator
            .executeFileUploadSaga("user-123", mockFile);
        
        // Then
        assertNotNull(response);
        assertNotEquals(UserFileMetadata.UploadStatus.UPLOADED, response.getStatus());
        
        // Verify rollback: file should be deleted from FileService
        verify(fileServiceClient, times(1)).deleteFile("uploaded-test.jpg");
    }
    
    @Test
    void testCreateUserMetadata_Success() {
        // Given
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        // When
        UserFileMetadata result = sagaOrchestrator
            .createUserMetadata("user-123", mockFile);
        
        // Then
        assertNotNull(result);
        assertEquals("user-123", result.getUserId());
        assertEquals("test.jpg", result.getOriginalFileName());
        assertEquals(UserFileMetadata.UploadStatus.PENDING, result.getUploadStatus());
        
        verify(metadataRepository, times(1)).save(any(UserFileMetadata.class));
    }
    
    @Test
    void testUploadFileToFileService_Success() {
        // Given
        FileServiceClient.FileServiceResponse fileServiceResponse = 
            new FileServiceClient.FileServiceResponse(
                "uploaded-test.jpg",
                "http://file-service/files/uploaded-test.jpg",
                12L,
                "image/jpeg",
                "Upload successful"
            );
        
        when(fileServiceClient.uploadFile(any(MultipartFile.class)))
            .thenReturn(ResponseEntity.ok(fileServiceResponse));
        
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        // When
        String fileName = sagaOrchestrator
            .uploadFileToFileService(mockMetadata, mockFile);
        
        // Then
        assertEquals("uploaded-test.jpg", fileName);
        verify(fileServiceClient, times(1)).uploadFile(mockFile);
        verify(metadataRepository, times(2)).save(mockMetadata);
    }
    
    @Test
    void testUpdateUserFileStatus_Success() {
        // Given
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        // When
        sagaOrchestrator.updateUserFileStatus(mockMetadata, "uploaded-test.jpg");
        
        // Then
        assertEquals(UserFileMetadata.UploadStatus.UPLOADED, mockMetadata.getUploadStatus());
        verify(metadataRepository, times(1)).save(mockMetadata);
    }
    
    @Test
    void testExecuteRollback_WithUploadedFile() {
        // Given
        String uploadedFileName = "uploaded-test.jpg";
        Exception error = new RuntimeException("Test error");
        
        when(fileServiceClient.deleteFile(anyString()))
            .thenReturn(ResponseEntity.ok().build());
        
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        // When
        sagaOrchestrator.executeRollback(mockMetadata, uploadedFileName, error);
        
        // Then
        verify(fileServiceClient, times(1)).deleteFile(uploadedFileName);
        verify(metadataRepository, times(1)).save(mockMetadata);
        assertEquals(UserFileMetadata.UploadStatus.ROLLBACK, mockMetadata.getUploadStatus());
        assertTrue(mockMetadata.getErrorMessage().contains("Test error"));
    }
    
    @Test
    void testExecuteRollback_FileServiceDeleteFails() {
        // Given
        String uploadedFileName = "uploaded-test.jpg";
        Exception error = new RuntimeException("Test error");
        
        when(fileServiceClient.deleteFile(anyString()))
            .thenThrow(new RuntimeException("Delete failed"));
        
        when(metadataRepository.save(any(UserFileMetadata.class)))
            .thenReturn(mockMetadata);
        
        // When - should not throw exception even if delete fails
        assertDoesNotThrow(() -> 
            sagaOrchestrator.executeRollback(mockMetadata, uploadedFileName, error)
        );
        
        // Then - metadata should still be marked as rollback
        verify(fileServiceClient, times(1)).deleteFile(uploadedFileName);
        verify(metadataRepository, times(1)).save(mockMetadata);
    }
}
