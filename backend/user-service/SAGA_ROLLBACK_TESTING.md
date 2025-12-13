# Saga Rollback Testing Guide

## Tổng quan

Hướng dẫn chi tiết để test các scenarios rollback của Saga pattern trong UserService.

## Prerequisites

1. **Backend Services đang chạy:**
   - UserService: http://localhost:8081
   - FileService: http://localhost:8082 (hoặc port tương ứng)
   - Database: PostgreSQL
   - Eureka Discovery: http://localhost:8761

2. **Tools:**
   - Postman/cURL
   - Browser để test
   - Database client (DBeaver, pgAdmin)

## Test Scenarios

### 1. Success Scenario - Upload thành công

**Mục đích:** Verify rằng flow bình thường hoạt động đúng

**Endpoint:**
```
POST http://localhost:8081/api/test/saga/upload-success
```

**Request:**
```bash
curl -X POST "http://localhost:8081/api/test/saga/upload-success?userId=test-user-1" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg"
```

**Expected Result:**
```json
{
  "id": 1,
  "userId": "test-user-1",
  "fileName": "abc123.jpg",
  "originalFileName": "test-image.jpg",
  "fileSize": 102400,
  "fileType": "image/jpeg",
  "fileUrl": "http://file-service/files/abc123.jpg",
  "status": "UPLOADED",
  "message": "File uploaded successfully"
}
```

**Verify:**
1. Check database: `SELECT * FROM user_file_metadata WHERE user_id = 'test-user-1'`
2. Status should be `UPLOADED`
3. File should exist in FileService

---

### 2. FileService Error Scenario - Rollback Step 1

**Mục đích:** Test rollback khi FileService không khả dụng

**Scenario:**
- Step 1: Create metadata ✓ (SUCCESS)
- Step 2: Upload to FileService ✗ (FAIL - FileService down)
- **Rollback:** Delete/mark metadata as ROLLBACK

**Endpoint:**
```
POST http://localhost:8081/api/test/saga/test-fileservice-error
```

**Request:**
```bash
curl -X POST "http://localhost:8081/api/test/saga/test-fileservice-error?userId=test-user-2" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg"
```

**Expected Result:**
```json
{
  "testScenario": "FileService Unavailable",
  "expectedBehavior": "Should rollback metadata creation",
  "uploadResponse": {
    "id": 2,
    "userId": "test-user-2",
    "status": "ROLLBACK",
    "message": "File upload failed: FileService error"
  },
  "status": "ROLLBACK",
  "rollbackExecuted": true,
  "rollbackCount": 1,
  "message": "FileService error simulated successfully"
}
```

**Verify:**
1. Check database: Metadata status = `ROLLBACK`
2. No file uploaded to FileService
3. Error message saved in `error_message` column

**SQL Verification:**
```sql
SELECT id, user_id, upload_status, error_message, created_at
FROM user_file_metadata 
WHERE user_id = 'test-user-2'
ORDER BY created_at DESC;
```

---

### 3. Database Error Scenario - Full Rollback

**Mục đích:** Test rollback khi database fail ở Step 3

**Scenario:**
- Step 1: Create metadata ✓ (SUCCESS)
- Step 2: Upload to FileService ✓ (SUCCESS)
- Step 3: Update status ✗ (FAIL - DB error)
- **Rollback:** Delete file from FileService + Delete metadata

**Endpoint:**
```
POST http://localhost:8081/api/test/saga/test-database-error
```

**Request:**
```bash
curl -X POST "http://localhost:8081/api/test/saga/test-database-error?userId=test-user-3" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg"
```

**Expected Result:**
```json
{
  "testScenario": "Database Update Error",
  "expectedBehavior": "Should rollback both file upload and metadata",
  "uploadResponse": {
    "id": 3,
    "userId": "test-user-3",
    "status": "ROLLBACK",
    "message": "File upload failed: Database error"
  },
  "status": "ROLLBACK",
  "rollbackExecuted": true,
  "message": "Database error simulated successfully"
}
```

**Verify:**
1. File should be deleted from FileService
2. Metadata status = `ROLLBACK` or deleted
3. No orphan files in FileService

---

### 4. Retry Scenario - Success after retry

**Mục đích:** Test retry mechanism

**Setup:**
1. Simulate temporary FileService error
2. Error should be retriable
3. After 2-3 retries, should succeed

**Manual Test:**
1. Tắt FileService
2. Upload file
3. Bật lại FileService trong 5 giây
4. Retry mechanism should kick in and succeed

---

## Monitoring & Verification Tools

### 1. Get User Files

**Endpoint:**
```
GET http://localhost:8081/api/test/saga/user-files/{userId}
```

**Example:**
```bash
curl http://localhost:8081/api/test/saga/user-files/test-user-1
```

**Response:**
```json
{
  "userId": "test-user-1",
  "totalFiles": 5,
  "files": [...],
  "statusCounts": {
    "PENDING": 0,
    "UPLOADING": 0,
    "UPLOADED": 3,
    "FAILED": 1,
    "ROLLBACK": 1
  }
}
```

### 2. Check Error Flags

**Get current flags:**
```bash
curl http://localhost:8081/api/test/saga/error-flags
```

**Set flags:**
```bash
curl -X POST "http://localhost:8081/api/test/saga/error-flags?fileServiceError=true"
```

**Reset flags:**
```bash
curl -X POST http://localhost:8081/api/test/saga/reset-flags
```

### 3. Cleanup Test Data

**Delete all test data:**
```bash
curl -X DELETE http://localhost:8081/api/test/saga/cleanup/test-user-1
```

---

## Step-by-Step Testing Procedure

### Test Flow 1: Normal Upload → Success

1. **Start services**
   ```bash
   # Terminal 1: Start UserService
   cd backend/user-service
   mvn spring-boot:run
   
   # Terminal 2: Start FileService
   cd backend/file-service
   mvn spring-boot:run
   ```

2. **Upload file**
   ```bash
   curl -X POST "http://localhost:8081/api/test/saga/upload-success?userId=user1" \
     -F "file=@test.jpg"
   ```

3. **Verify result**
   ```bash
   curl http://localhost:8081/api/test/saga/user-files/user1
   ```

4. **Check database**
   ```sql
   SELECT * FROM user_file_metadata WHERE user_id = 'user1';
   ```

### Test Flow 2: FileService Down → Rollback

1. **Stop FileService**
   ```bash
   # Ctrl+C in FileService terminal
   ```

2. **Upload file (should fail)**
   ```bash
   curl -X POST "http://localhost:8081/api/test/saga/test-fileservice-error?userId=user2" \
     -F "file=@test.jpg"
   ```

3. **Verify rollback**
   ```bash
   curl http://localhost:8081/api/test/saga/user-files/user2
   ```

4. **Check status = ROLLBACK**
   ```sql
   SELECT upload_status, error_message 
   FROM user_file_metadata 
   WHERE user_id = 'user2';
   ```

### Test Flow 3: Database Error → Full Rollback

1. **Enable database error simulation**
   ```bash
   curl -X POST "http://localhost:8081/api/test/saga/error-flags?databaseError=true"
   ```

2. **Upload file**
   ```bash
   curl -X POST "http://localhost:8081/api/test/saga/test-database-error?userId=user3" \
     -F "file=@test.jpg"
   ```

3. **Verify:**
   - Metadata rollback
   - File deleted from FileService
   
4. **Reset flags**
   ```bash
   curl -X POST http://localhost:8081/api/test/saga/reset-flags
   ```

---

## Database Queries for Verification

### 1. View all uploads
```sql
SELECT 
    id,
    user_id,
    original_file_name,
    upload_status,
    error_message,
    created_at,
    updated_at
FROM user_file_metadata
ORDER BY created_at DESC;
```

### 2. Count by status
```sql
SELECT 
    upload_status,
    COUNT(*) as count
FROM user_file_metadata
GROUP BY upload_status;
```

### 3. Failed uploads
```sql
SELECT *
FROM user_file_metadata
WHERE upload_status IN ('FAILED', 'ROLLBACK')
ORDER BY created_at DESC;
```

### 4. Cleanup test data
```sql
DELETE FROM user_file_metadata 
WHERE user_id LIKE 'test-user-%';
```

---

## Expected Logs

### Success Upload
```
INFO  Starting file upload saga for user: test-user-1
INFO  Step 1 completed: Metadata created with ID: 123
INFO  Step 2 completed: File uploaded successfully: abc.jpg
INFO  Step 3 completed: Status updated to UPLOADED
```

### FileService Error → Rollback
```
INFO  Starting file upload saga for user: test-user-2
INFO  Step 1 completed: Metadata created with ID: 124
ERROR FileService call failed: 503 Service Unavailable
WARN  Saga failed, executing rollback
INFO  Rollback Step 1: Marking metadata as ROLLBACK
```

### Database Error → Full Rollback
```
INFO  Starting file upload saga for user: test-user-3
INFO  Step 1 completed: Metadata created with ID: 125
INFO  Step 2 completed: File uploaded successfully: xyz.jpg
ERROR Failed to update status: Database connection error
WARN  Saga failed, executing rollback
INFO  Rollback Step 2: Deleting file from FileService: xyz.jpg
INFO  File deleted successfully from FileService
INFO  Rollback Step 1: Marking metadata as ROLLBACK
```

---

## Troubleshooting

### Issue: Rollback không xóa file từ FileService

**Debug:**
1. Check FileService logs
2. Verify FileServiceClient configuration
3. Check network connectivity

**Fix:**
```java
// Add more detailed logging in FileServiceClient
log.info("Attempting to delete file: {}", fileName);
```

### Issue: Metadata không được rollback

**Debug:**
1. Check transaction configuration
2. Verify database connection
3. Check exception handling

**SQL:**
```sql
-- Check for stuck UPLOADING status
SELECT * FROM user_file_metadata 
WHERE upload_status = 'UPLOADING' 
AND updated_at < NOW() - INTERVAL '5 minutes';
```

---

## Best Practices

1. **Always cleanup after testing**
   ```bash
   curl -X DELETE http://localhost:8081/api/test/saga/cleanup/test-user-1
   ```

2. **Monitor logs** trong testing để hiểu flow

3. **Verify database** sau mỗi test

4. **Test với multiple concurrent uploads** để check race conditions

5. **Test với different file sizes** để check timeout handling

---

## Automated Test Script

```bash
#!/bin/bash

# Test Script cho Saga Rollback
BASE_URL="http://localhost:8081/api/test/saga"
TEST_USER="auto-test-user"
TEST_FILE="test.jpg"

echo "=== Saga Rollback Test Suite ==="

# Test 1: Success
echo "Test 1: Successful Upload"
curl -X POST "$BASE_URL/upload-success?userId=$TEST_USER" \
  -F "file=@$TEST_FILE" \
  -s | jq .

# Test 2: FileService Error
echo "Test 2: FileService Error"
curl -X POST "$BASE_URL/test-fileservice-error?userId=$TEST_USER" \
  -F "file=@$TEST_FILE" \
  -s | jq .

# Test 3: Database Error
echo "Test 3: Database Error"
curl -X POST "$BASE_URL/test-database-error?userId=$TEST_USER" \
  -F "file=@$TEST_FILE" \
  -s | jq .

# Verify
echo "Verification: Get all files"
curl "$BASE_URL/user-files/$TEST_USER" -s | jq .

# Cleanup
echo "Cleanup test data"
curl -X DELETE "$BASE_URL/cleanup/$TEST_USER" -s | jq .

echo "=== Test Suite Completed ==="
```

Save as `test-saga-rollback.sh` và chạy:
```bash
chmod +x test-saga-rollback.sh
./test-saga-rollback.sh
```
