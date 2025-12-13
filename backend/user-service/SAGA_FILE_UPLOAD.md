# File Upload Saga Pattern Implementation

## Tổng quan

Implementation này triển khai Saga orchestration pattern cho việc upload file từ UserService sang FileService với đầy đủ cơ chế:
- **Retry mechanism**: Tự động retry khi có lỗi tạm thời
- **Compensating transactions**: Rollback khi có lỗi không thể khôi phục
- **Transaction management**: Đảm bảo consistency của dữ liệu

## Kiến trúc

### Saga Flow

```
Client --> UserService --> FileService
              |
              v
         Database (Metadata)
```

### Các bước trong Saga

1. **Step 1: createUserMetadata()**
   - Tạo metadata trong database
   - Trạng thái: PENDING
   - Compensating transaction: Xóa hoặc đánh dấu ROLLBACK

2. **Step 2: uploadFileToFileService()**
   - Gọi FileService API để upload file
   - Cập nhật trạng thái: UPLOADING
   - Compensating transaction: Xóa file từ FileService

3. **Step 3: updateUserFileStatus()**
   - Cập nhật trạng thái: UPLOADED
   - Compensating transaction: Rollback Step 2 và Step 1

## Components

### 1. Domain Model

**UserFileMetadata.java**
- Entity lưu metadata của file
- Các trạng thái: PENDING → UPLOADING → UPLOADED (hoặc FAILED/ROLLBACK)

### 2. Saga Orchestrators

**FileUploadSagaOrchestrator.java**
- Basic orchestrator
- Thực thi 3 steps tuần tự
- Rollback khi có lỗi

**EnhancedFileUploadSagaOrchestrator.java**
- Enhanced version với retry cho mỗi step
- Sử dụng SagaRetryManager
- Retry cả compensating transactions

### 3. FileService Client

**FileServiceClient.java**
- Feign client để gọi FileService
- Upload file endpoint
- Delete file endpoint (cho rollback)

**FileServiceClientConfig.java**
- Retry policy: 3 attempts, exponential backoff
- Timeout: 5s connect, 30s read
- Error decoder: Custom exception handling

### 4. Retry Manager

**SagaRetryManager.java**
- Centralized retry logic
- Exponential backoff: 1s → 2s → 4s
- Recovery callback support

### 5. REST Controller

**UserFileController.java**
- Endpoint: POST /api/users/files/upload
- Accept: multipart/form-data
- File validation (size, type)
- Return: FileUploadResponse

## Cách sử dụng

### 1. Upload file từ client

```bash
curl -X POST http://localhost:8081/api/users/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.jpg"
```

### 2. Response thành công

```json
{
  "id": 123,
  "userId": "user-456",
  "fileName": "abc123.jpg",
  "originalFileName": "file.jpg",
  "fileSize": 102400,
  "fileType": "image/jpeg",
  "fileUrl": "http://file-service/files/abc123.jpg",
  "status": "UPLOADED",
  "message": "File uploaded successfully"
}
```

### 3. Response lỗi (sau rollback)

```json
{
  "id": 123,
  "userId": "user-456",
  "status": "ROLLBACK",
  "message": "File upload failed: FileService error"
}
```

## Error Handling và Rollback Scenarios

### Scenario 1: FileService không khả dụng

1. Step 1: Metadata created ✓
2. Step 2: Upload fail (FileService down) ✗
3. **Rollback**: Xóa metadata từ DB
4. Return error response

### Scenario 2: Upload thành công nhưng DB update fail

1. Step 1: Metadata created ✓
2. Step 2: File uploaded ✓
3. Step 3: Update status fail ✗
4. **Rollback**: 
   - Xóa file từ FileService
   - Xóa metadata từ DB
5. Return error response

### Scenario 3: Network timeout trong upload

1. Step 1: Metadata created ✓
2. Step 2: Upload timeout ✗
3. **Retry**: Thử lại 3 lần với backoff
4. Nếu vẫn fail → Rollback Step 1
5. Return error response

## Configuration

### application.yaml

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

# Feign client sẽ tự động discover FileService qua Eureka
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

### Retry Configuration

Retry được config trong code:
- Max attempts: 3
- Initial backoff: 1000ms
- Max backoff: 5000ms
- Multiplier: 2.0 (exponential)

## Database Schema

```sql
CREATE TABLE user_file_metadata (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    original_file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url VARCHAR(500),
    upload_status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_user_file_metadata_user_id ON user_file_metadata(user_id);
CREATE INDEX idx_user_file_metadata_status ON user_file_metadata(upload_status);
```

## Testing

### Unit Test Example

```java
@Test
void testFileUploadSaga_Success() {
    // Mock dependencies
    when(fileServiceClient.uploadFile(any()))
        .thenReturn(ResponseEntity.ok(
            new FileServiceResponse("file.jpg", "url", 1024L, "image/jpeg", "OK")
        ));
    
    // Execute saga
    FileUploadResponse response = sagaOrchestrator
        .executeFileUploadSaga("user-123", mockFile);
    
    // Verify
    assertEquals(UploadStatus.UPLOADED, response.getStatus());
    verify(metadataRepository, times(3)).save(any()); // 3 steps
}

@Test
void testFileUploadSaga_RollbackOnFileServiceError() {
    // Mock FileService error
    when(fileServiceClient.uploadFile(any()))
        .thenThrow(new FeignException.ServiceUnavailable("", request, null, null));
    
    // Execute saga
    FileUploadResponse response = sagaOrchestrator
        .executeFileUploadSaga("user-123", mockFile);
    
    // Verify rollback
    assertEquals(UploadStatus.ROLLBACK, response.getStatus());
    verify(metadataRepository).delete(any()); // Rollback step 1
}
```

## Monitoring và Logging

### Log Levels

- **INFO**: Saga start/completion, step completion
- **WARN**: Retry attempts, rollback execution
- **ERROR**: Final failures, critical errors

### Example Logs

```
2024-12-07 10:00:00 INFO  Starting file upload saga for user: user-123
2024-12-07 10:00:01 INFO  Step 1 completed: Metadata created with ID: 456
2024-12-07 10:00:02 INFO  Step 2 completed: File uploaded successfully: abc.jpg
2024-12-07 10:00:03 INFO  Step 3 completed: Status updated to UPLOADED
```

## Best Practices

1. **Idempotency**: Mỗi step nên idempotent để retry an toàn
2. **Timeouts**: Set timeout hợp lý cho từng operation
3. **Monitoring**: Log chi tiết mỗi step và rollback
4. **Cleanup**: Định kỳ cleanup các metadata ở trạng thái FAILED/ROLLBACK
5. **Transaction boundaries**: Mỗi step trong transaction riêng

## Limitations và Future Improvements

### Current Limitations
- Synchronous saga (blocking)
- No distributed transaction support
- Limited to 2-phase (do-undo)

### Future Improvements
- [ ] Async saga với message queue
- [ ] Saga state persistence (recovery sau restart)
- [ ] Circuit breaker pattern
- [ ] Dead letter queue cho failed sagas
- [ ] Saga monitoring dashboard
- [ ] Automatic compensation retry schedule

## Dependencies

```xml
<!-- Spring Retry -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>

<!-- OpenFeign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

<!-- Feign Form (multipart support) -->
<dependency>
    <groupId>io.github.openfeign.form</groupId>
    <artifactId>feign-form-spring</artifactId>
</dependency>
```
