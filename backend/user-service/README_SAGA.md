# User Service - File Upload với Saga Pattern

## Tổng quan

Implementation hoàn chỉnh của **Saga Orchestration Pattern** cho việc upload file từ UserService sang FileService trong kiến trúc microservices.

## Đặc điểm chính

✅ **Saga Orchestration Pattern**
- 3 bước tuần tự với compensating transactions
- Automatic rollback khi có lỗi
- Transaction consistency across services

✅ **Retry Mechanism**
- Exponential backoff (1s → 2s → 4s → 5s)
- Configurable retry attempts (default: 3)
- Retry cho cả main operations và rollback

✅ **Resilience**
- Circuit breaker pattern (via Feign)
- Timeout handling
- Error recovery

✅ **Production Ready**
- Comprehensive logging
- Unit tests
- Error handling
- Monitoring support

## Cấu trúc File

```
user-service/
├── src/main/java/com/cnweb2025/user_service/
│   ├── entity/
│   │   └── UserFileMetadata.java              # Domain model
│   ├── repository/
│   │   └── UserFileMetadataRepository.java    # Data access
│   ├── dto/
│   │   ├── request/
│   │   │   └── FileUploadRequest.java
│   │   └── response/
│   │       └── FileUploadResponse.java
│   ├── client/
│   │   ├── FileServiceClient.java             # Feign client
│   │   └── FileServiceClientConfig.java       # Retry + timeout config
│   ├── saga/
│   │   ├── FileUploadSagaOrchestrator.java    # Basic orchestrator
│   │   ├── EnhancedFileUploadSagaOrchestrator.java  # With retry
│   │   └── SagaRetryManager.java              # Centralized retry
│   ├── service/
│   │   └── UserFileService.java               # Business logic
│   ├── controller/
│   │   └── UserFileController.java            # REST API
│   └── configuration/
│       └── RetryConfiguration.java            # Enable Spring Retry
├── src/test/java/
│   └── saga/
│       └── FileUploadSagaOrchestratorTest.java  # Unit tests
├── SAGA_FILE_UPLOAD.md                        # Technical documentation
├── SAGA_USAGE_EXAMPLES.md                     # Usage examples
└── README_SAGA.md                             # This file
```

## Saga Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/users/files/upload
       │ (multipart/form-data)
       ▼
┌─────────────────────────────────────────────┐
│         UserFileController                   │
│  - Validate file (size, type)               │
│  - Extract userId from JWT                  │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│    FileUploadSagaOrchestrator               │
│                                             │
│  Step 1: createUserMetadata()              │
│  ├─ Save to DB (status: PENDING)           │
│  └─ Rollback: Delete/mark ROLLBACK         │
│                                             │
│  Step 2: uploadFileToFileService()         │
│  ├─ Update status: UPLOADING               │
│  ├─ Call FileService API (with retry)      │
│  ├─ Save fileName & fileUrl                │
│  └─ Rollback: Delete file from FileService │
│                                             │
│  Step 3: updateUserFileStatus()            │
│  ├─ Update status: UPLOADED                │
│  └─ Rollback: Steps 2 + 1                  │
└──────────┬──────────────────────────────────┘
           │
           ▼
    ┌─────────────┐        ┌──────────────┐
    │  Database   │        │ FileService  │
    │ (Metadata)  │        │  (Storage)   │
    └─────────────┘        └──────────────┘
```

## Quick Start

### 1. Thêm dependency (đã có trong pom.xml)

```xml
<!-- Spring Retry -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>

<!-- OpenFeign với multipart support -->
<dependency>
    <groupId>io.github.openfeign.form</groupId>
    <artifactId>feign-form-spring</artifactId>
    <version>3.8.0</version>
</dependency>
```

### 2. Database Migration

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

### 3. Upload File

```bash
curl -X POST http://localhost:8081/api/users/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.jpg"
```

## API Documentation

### Upload File

**Endpoint:** `POST /api/users/files/upload`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `file`: File to upload (max 10MB)

**Response Success (200):**
```json
{
  "id": 123,
  "userId": "user-456",
  "fileName": "abc123.jpg",
  "originalFileName": "photo.jpg",
  "fileSize": 102400,
  "fileType": "image/jpeg",
  "fileUrl": "http://file-service/files/abc123.jpg",
  "status": "UPLOADED",
  "message": "File uploaded successfully"
}
```

**Response Error (500):**
```json
{
  "id": 123,
  "userId": "user-456",
  "status": "ROLLBACK",
  "message": "File upload failed: FileService unavailable"
}
```

## Configuration

### application.yaml

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

# FileService sẽ được discover qua Eureka
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

### Retry Configuration (trong code)

```java
// FileServiceClientConfig.java
public Retryer retryer() {
    return new Retryer.Default(
        1000,  // Initial interval
        3000,  // Max interval
        3      // Max attempts
    );
}
```

## Testing

### Run Unit Tests

```bash
cd backend/user-service
mvn test -Dtest=FileUploadSagaOrchestratorTest
```

### Test Coverage
- ✅ Successful upload scenario
- ✅ FileService unavailable (rollback)
- ✅ Database error during update (rollback)
- ✅ Rollback với file service delete failure
- ✅ Individual step testing

## Monitoring

### Health Check

```bash
curl http://localhost:8081/actuator/health
```

### Metrics

```bash
curl http://localhost:8081/actuator/metrics
```

### Upload Statistics

```bash
curl http://localhost:8081/api/admin/uploads/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Rollback Scenarios

| Scenario | Step Failed | Rollback Actions |
|----------|-------------|------------------|
| 1 | Step 1: Create Metadata | N/A (nothing to rollback) |
| 2 | Step 2: Upload File | Delete metadata from DB |
| 3 | Step 3: Update Status | Delete file from FileService + Delete metadata |

## Best Practices

1. **Idempotency**
   - Mỗi step có thể retry an toàn
   - Sử dụng unique file names để tránh conflicts

2. **Error Handling**
   - Log đầy đủ mỗi step
   - Distinguish giữa retriable và non-retriable errors
   - Graceful degradation

3. **Performance**
   - Index database cho fast queries
   - Set timeout hợp lý (30s cho upload)
   - Cleanup old metadata định kỳ

4. **Security**
   - Validate file type và size
   - Sanitize file names
   - Check user permissions

## Troubleshooting

### Issue: Upload timeout

**Nguyên nhân:** File quá lớn hoặc network chậm

**Giải pháp:**
1. Tăng timeout trong `FileServiceClientConfig`
2. Implement chunked upload
3. Compress file trước khi upload

### Issue: Too many rollbacks

**Nguyên nhân:** FileService không ổn định

**Giải pháp:**
1. Check FileService health
2. Implement circuit breaker
3. Tăng retry attempts

### Issue: Database locks

**Nguyên nhân:** Concurrent uploads cùng user

**Giải pháp:**
1. Implement optimistic locking
2. Use queue cho uploads
3. Add database connection pool tuning

## Future Enhancements

- [ ] Async saga với message queue
- [ ] Saga state machine persistence
- [ ] Circuit breaker integration
- [ ] Distributed tracing
- [ ] Saga execution monitoring dashboard
- [ ] Automatic cleanup scheduler
- [ ] Chunked upload support
- [ ] Resume interrupted uploads

## References

- [SAGA_FILE_UPLOAD.md](./SAGA_FILE_UPLOAD.md) - Technical details
- [SAGA_USAGE_EXAMPLES.md](./SAGA_USAGE_EXAMPLES.md) - Code examples
- [Spring Retry Documentation](https://docs.spring.io/spring-retry/docs/current/reference/html/)
- [OpenFeign Documentation](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)

## Support

For issues or questions:
1. Check documentation files
2. Review test cases
3. Check logs for detailed error messages
4. Contact development team

---

**Version:** 1.0.0  
**Last Updated:** December 7, 2025  
**Author:** Development Team
