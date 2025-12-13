# 🚀 Quick Start - Test Saga Rollback

## Bước 1: Start Services

### Terminal 1 - Start Database (nếu chưa chạy)
```bash
# PostgreSQL should be running
# Check connection: localhost:5432
```

### Terminal 2 - Start UserService
```bash
cd backend/user-service
mvn clean install
mvn spring-boot:run
```

Đợi cho đến khi thấy log:
```
Started UserServiceApplication in X.XXX seconds
```

## Bước 2: Tạo Database Table

Nếu chưa có table, chạy SQL này:

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

## Bước 3: Chọn Testing Method

### Option 1: Web UI (Recommended - Dễ nhất)

1. Mở file `saga-test.html` trong browser:
   ```
   file:///F:/cnweb_20251/backend/user-service/saga-test.html
   ```

2. Chọn file để upload (bất kỳ file nào < 10MB)

3. Click các button để test:
   - **Upload File** - Test success scenario
   - **Test FileService Error** - Test rollback scenario 1
   - **Test Database Error** - Test rollback scenario 2

4. Click **Get User Files** để xem kết quả

5. Click **Cleanup** để xóa test data

### Option 2: Postman

1. Import collection `Saga_Rollback_Testing.postman_collection.json` vào Postman

2. Chạy các request theo thứ tự:
   - **1. Success Scenarios → Upload Success**
   - **2. Rollback Scenarios → Test FileService Error**
   - **2. Rollback Scenarios → Test Database Error**
   - **3. Monitoring → Get User Files**
   - **5. Cleanup → Cleanup Test User 1**

### Option 3: cURL Commands

```bash
# Test 1: Success Upload
curl -X POST "http://localhost:8081/api/test/saga/upload-success?userId=test-user-1" \
  -F "file=@test.jpg"

# Test 2: FileService Error
curl -X POST "http://localhost:8081/api/test/saga/test-fileservice-error?userId=test-user-2" \
  -F "file=@test.jpg"

# Test 3: Database Error
curl -X POST "http://localhost:8081/api/test/saga/test-database-error?userId=test-user-3" \
  -F "file=@test.jpg"

# Get user files
curl "http://localhost:8081/api/test/saga/user-files/test-user-1"

# Cleanup
curl -X DELETE "http://localhost:8081/api/test/saga/cleanup/test-user-1"
```

## Bước 4: Verify Results

### Success Upload (Test 1)
**Expected:**
```json
{
  "status": "UPLOADED",
  "message": "File uploaded successfully"
}
```

### FileService Error (Test 2)
**Expected:**
```json
{
  "testScenario": "FileService Unavailable",
  "rollbackExecuted": true,
  "status": "ROLLBACK"
}
```

### Database Error (Test 3)
**Expected:**
```json
{
  "testScenario": "Database Update Error",
  "rollbackExecuted": true,
  "status": "ROLLBACK" or "FAILED"
}
```

## Bước 5: Check Database

```sql
-- Xem tất cả uploads
SELECT id, user_id, original_file_name, upload_status, error_message
FROM user_file_metadata
ORDER BY created_at DESC;

-- Count theo status
SELECT upload_status, COUNT(*)
FROM user_file_metadata
GROUP BY upload_status;
```

**Expected Results:**
- Test 1: 1 record với status = `UPLOADED`
- Test 2: 1 record với status = `ROLLBACK`
- Test 3: 1 record với status = `ROLLBACK` hoặc `FAILED`

## Troubleshooting

### Lỗi: Connection refused

**Nguyên nhân:** UserService chưa chạy

**Fix:**
```bash
cd backend/user-service
mvn spring-boot:run
```

### Lỗi: Table does not exist

**Nguyên nhân:** Chưa tạo table

**Fix:** Chạy SQL ở Bước 2

### Lỗi: CORS

**Nguyên nhân:** Browser block CORS

**Fix:** 
1. Sử dụng Postman thay vì web UI
2. Hoặc thêm CORS config vào UserService:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("*");
            }
        };
    }
}
```

### FileService test không hoạt động

**Lưu ý:** Test FileService error KHÔNG CẦN FileService chạy. Test này simulate error, không thực sự call FileService.

## Expected Logs

### Success Upload
```
INFO  Starting file upload saga for user: test-user-1
INFO  Step 1 completed: Metadata created with ID: 1
INFO  Step 2 completed: File uploaded successfully: abc.jpg
INFO  Step 3 completed: Status updated to UPLOADED
```

### FileService Error
```
INFO  Starting file upload saga for user: test-user-2
INFO  Step 1 completed: Metadata created with ID: 2
WARN  Saga failed, executing rollback
INFO  Rollback Step 1: Marking metadata as ROLLBACK
```

## Next Steps

1. ✅ Test success scenario
2. ✅ Test rollback scenarios
3. ✅ Verify database
4. 📖 Đọc `SAGA_ROLLBACK_TESTING.md` để hiểu chi tiết
5. 🔍 Xem logs để understand flow
6. 🧪 Thử modify code để test edge cases

## Important Notes

⚠️ **Testing endpoints** (`/api/test/saga/**`) chỉ dùng cho development/testing!

🔒 **Trong production**, phải:
1. Disable hoặc secure testing endpoints
2. Sử dụng real authentication
3. Add proper authorization checks
4. Monitor logs và metrics

Happy Testing! 🎉
