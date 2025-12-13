# File Upload Saga Pattern - Usage Examples

## Quick Start

### 1. Upload File từ Client (cURL)

```bash
# Upload với JWT authentication
curl -X POST http://localhost:8081/api/users/files/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/document.pdf"
```

### 2. Upload File từ Frontend (JavaScript)

```javascript
// React/Vue/Angular example
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('http://localhost:8081/api/users/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.status === 'UPLOADED') {
      console.log('Upload successful:', result);
      // Handle success: display file URL, update UI, etc.
    } else {
      console.error('Upload failed:', result.message);
      // Handle error: show error message to user
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### 3. Upload File từ Postman

1. Method: **POST**
2. URL: `http://localhost:8081/api/users/files/upload`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body: **form-data**
   - Key: `file`
   - Type: **File**
   - Value: Select your file

## Advanced Usage

### 1. Upload với Enhanced Saga (Retry Support)

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserFileService userFileService;
    
    @PostMapping("/avatar/upload")
    public ResponseEntity<FileUploadResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        String userId = authentication.getName();
        
        // Sử dụng enhanced version với retry
        FileUploadResponse response = userFileService
            .uploadFileWithRetry(userId, file);
        
        if (response.getStatus() == UploadStatus.UPLOADED) {
            // Cập nhật avatar URL trong User entity
            updateUserAvatar(userId, response.getFileUrl());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
        }
    }
}
```

### 2. Batch Upload với Transaction

```java
@Service
public class BatchUploadService {
    
    @Autowired
    private UserFileService userFileService;
    
    /**
     * Upload multiple files trong một transaction
     * Nếu 1 file fail, rollback tất cả
     */
    @Transactional
    public List<FileUploadResponse> uploadBatch(
            String userId, 
            List<MultipartFile> files) {
        
        List<FileUploadResponse> responses = new ArrayList<>();
        
        for (MultipartFile file : files) {
            FileUploadResponse response = userFileService
                .uploadFileWithRetry(userId, file);
            
            if (response.getStatus() != UploadStatus.UPLOADED) {
                // Nếu có lỗi, throw exception để rollback
                throw new BatchUploadException(
                    "Failed to upload: " + file.getOriginalFilename()
                );
            }
            
            responses.add(response);
        }
        
        return responses;
    }
}
```

### 3. Async Upload với CompletableFuture

```java
@Service
public class AsyncUploadService {
    
    @Autowired
    private UserFileService userFileService;
    
    @Async
    public CompletableFuture<FileUploadResponse> uploadAsync(
            String userId, 
            MultipartFile file) {
        
        return CompletableFuture.supplyAsync(() -> 
            userFileService.uploadFileWithRetry(userId, file)
        );
    }
    
    /**
     * Upload multiple files concurrently
     */
    public List<FileUploadResponse> uploadConcurrently(
            String userId, 
            List<MultipartFile> files) {
        
        List<CompletableFuture<FileUploadResponse>> futures = files.stream()
            .map(file -> uploadAsync(userId, file))
            .collect(Collectors.toList());
        
        return futures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toList());
    }
}
```

## Integration với Business Logic

### 1. User Profile Update với File Upload

```java
@Service
public class UserProfileService {
    
    @Autowired
    private UserFileService userFileService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Update user profile với avatar upload
     */
    @Transactional
    public UserResponse updateProfileWithAvatar(
            String userId,
            UserUpdateRequest request,
            MultipartFile avatarFile) {
        
        // 1. Upload avatar file (with Saga)
        FileUploadResponse fileResponse = userFileService
            .uploadFileWithRetry(userId, avatarFile);
        
        if (fileResponse.getStatus() != UploadStatus.UPLOADED) {
            throw new FileUploadException(
                "Failed to upload avatar: " + fileResponse.getMessage()
            );
        }
        
        // 2. Update user profile
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setAvatarUrl(fileResponse.getFileUrl()); // Set avatar URL
        
        User savedUser = userRepository.save(user);
        
        return UserMapper.toResponse(savedUser);
    }
}
```

### 2. Document Upload cho Seller Verification

```java
@Service
public class SellerVerificationService {
    
    @Autowired
    private UserFileService userFileService;
    
    @Autowired
    private SellerProfileRepository sellerProfileRepository;
    
    /**
     * Upload verification documents
     */
    @Transactional
    public VerificationResponse uploadVerificationDocuments(
            String userId,
            MultipartFile businessLicense,
            MultipartFile idCard) {
        
        try {
            // Upload business license
            FileUploadResponse licenseResponse = userFileService
                .uploadFileWithRetry(userId, businessLicense);
            
            if (licenseResponse.getStatus() != UploadStatus.UPLOADED) {
                throw new DocumentUploadException(
                    "Failed to upload business license"
                );
            }
            
            // Upload ID card
            FileUploadResponse idResponse = userFileService
                .uploadFileWithRetry(userId, idCard);
            
            if (idResponse.getStatus() != UploadStatus.UPLOADED) {
                // Rollback: delete uploaded business license
                // (Saga đã handle rollback tự động)
                throw new DocumentUploadException(
                    "Failed to upload ID card"
                );
            }
            
            // Create or update seller profile
            SellerProfile profile = sellerProfileRepository
                .findByUserId(userId)
                .orElse(new SellerProfile());
            
            profile.setUserId(userId);
            profile.setBusinessLicenseUrl(licenseResponse.getFileUrl());
            profile.setIdCardUrl(idResponse.getFileUrl());
            profile.setVerificationStatus(VerificationStatus.PENDING);
            
            sellerProfileRepository.save(profile);
            
            return VerificationResponse.builder()
                .status("SUCCESS")
                .message("Documents uploaded successfully")
                .build();
                
        } catch (Exception e) {
            log.error("Verification upload failed", e);
            throw new VerificationUploadException(
                "Failed to upload verification documents", e
            );
        }
    }
}
```

## Monitoring và Cleanup

### 1. Scheduled Cleanup Task

```java
@Component
public class FileUploadCleanupTask {
    
    @Autowired
    private UserFileService userFileService;
    
    /**
     * Cleanup failed uploads mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupFailedUploads() {
        log.info("Starting scheduled cleanup of failed uploads");
        
        try {
            int cleaned = userFileService.cleanupFailedUploads();
            log.info("Cleaned up {} failed uploads", cleaned);
        } catch (Exception e) {
            log.error("Failed to cleanup uploads", e);
        }
    }
}
```

### 2. Monitoring Endpoint

```java
@RestController
@RequestMapping("/api/admin/uploads")
public class UploadMonitoringController {
    
    @Autowired
    private UserFileService userFileService;
    
    @GetMapping("/stats")
    public ResponseEntity<UploadStats> getUploadStats() {
        List<UserFileMetadata> pending = userFileService
            .getFilesByStatus(UploadStatus.PENDING);
        
        List<UserFileMetadata> uploading = userFileService
            .getFilesByStatus(UploadStatus.UPLOADING);
        
        List<UserFileMetadata> uploaded = userFileService
            .getFilesByStatus(UploadStatus.UPLOADED);
        
        List<UserFileMetadata> failed = userFileService
            .getFilesByStatus(UploadStatus.FAILED);
        
        List<UserFileMetadata> rollback = userFileService
            .getFilesByStatus(UploadStatus.ROLLBACK);
        
        UploadStats stats = UploadStats.builder()
            .pending(pending.size())
            .uploading(uploading.size())
            .uploaded(uploaded.size())
            .failed(failed.size())
            .rollback(rollback.size())
            .build();
        
        return ResponseEntity.ok(stats);
    }
}
```

## Error Handling Best Practices

### 1. Custom Exception Handling

```java
@RestControllerAdvice
public class FileUploadExceptionHandler {
    
    @ExceptionHandler(FileUploadSagaOrchestrator.SagaException.class)
    public ResponseEntity<ErrorResponse> handleSagaException(
            FileUploadSagaOrchestrator.SagaException ex) {
        
        log.error("Saga exception occurred", ex);
        
        ErrorResponse error = ErrorResponse.builder()
            .code("SAGA_ERROR")
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error);
    }
    
    @ExceptionHandler(FileServiceClientConfig.FileServiceException.class)
    public ResponseEntity<ErrorResponse> handleFileServiceException(
            FileServiceClientConfig.FileServiceException ex) {
        
        log.error("FileService exception occurred", ex);
        
        ErrorResponse error = ErrorResponse.builder()
            .code("FILE_SERVICE_ERROR")
            .message("File service is temporarily unavailable")
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(error);
    }
}
```

### 2. Client-Side Retry Logic

```javascript
async function uploadFileWithRetry(file, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries}`);
      
      const response = await uploadFile(file);
      
      if (response.status === 'UPLOADED') {
        return response;
      }
      
      // Server-side error, but might be temporary
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      if (attempt >= maxRetries) {
        throw new Error(`Upload failed after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
  
  throw new Error('Upload failed');
}
```

## Performance Tips

1. **File Size Optimization**
   - Compress images trước khi upload
   - Validate file size ở client-side
   - Sử dụng chunked upload cho files lớn

2. **Concurrent Uploads**
   - Limit concurrent uploads (max 3-5)
   - Use queue cho batch uploads
   - Monitor memory usage

3. **Database Performance**
   - Index trên `user_id` và `upload_status`
   - Partition table theo created_at
   - Archive old metadata

4. **Caching**
   - Cache file metadata cho frequently accessed files
   - Use CDN cho file URLs
   - Implement ETag for conditional requests
