# 📮 Hướng dẫn Test Saga Rollback bằng Postman

## Bước 1: Import Collection vào Postman

### Cách 1: Import từ file
1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn tab **File**
4. Click **Choose Files**
5. Chọn file: `F:\cnweb_20251\backend\user-service\Saga_Rollback_Testing.postman_collection.json`
6. Click **Import**

### Cách 2: Drag & Drop
1. Mở Postman
2. Kéo file `Saga_Rollback_Testing.postman_collection.json` vào cửa sổ Postman
3. Click **Import**

**Kết quả:** Bạn sẽ thấy collection "Saga Rollback Testing" trong sidebar

---

## Bước 2: Chuẩn bị Test File

1. Tạo một file test bất kỳ (ảnh, PDF, document) < 10MB
2. Đặt tên file: `test-image.jpg` hoặc `test.pdf`
3. Lưu vào một folder dễ tìm (ví dụ: Desktop)

**Lưu ý:** File này sẽ được upload trong các test case

---

## Bước 3: Start UserService

```bash
# Terminal
cd F:\cnweb_20251\backend\user-service
mvn spring-boot:run
```

**Đợi cho đến khi thấy:**
```
Started UserServiceApplication in X.XXX seconds
```

**Verify service đang chạy:**
- Mở browser: http://localhost:8081/actuator/health
- Nên thấy: `{"status":"UP"}`

---

## Bước 4: Test Scenarios

### ✅ Test 1: Upload Success (Thành công)

**Mục đích:** Verify flow bình thường hoạt động đúng

1. Trong Postman, mở folder **"1. Success Scenarios"**
2. Click vào request **"Upload Success"**
3. Click tab **Body**
4. Trong form-data, dòng `file`:
   - Click **Select Files**
   - Chọn file test của bạn
5. Click **Send** (nút xanh)

**Expected Response:**
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

**✓ Success indicators:**
- Status code: **200 OK**
- Response status: **"UPLOADED"**
- Message: **"File uploaded successfully"**

**Screenshot:**
```
POST http://localhost:8081/api/test/saga/upload-success?userId=test-user-1
Status: 200 OK
Time: ~500ms
Size: ~250 B
```

---

### ❌ Test 2: FileService Error → Rollback

**Mục đích:** Test rollback khi FileService không khả dụng

**Scenario:**
- ✓ Step 1: Create metadata (SUCCESS)
- ✗ Step 2: Upload to FileService (FAIL - simulated)
- → Rollback: Delete metadata

**Steps:**

1. Mở folder **"2. Rollback Scenarios"**
2. Click **"Test FileService Error"**
3. Tab **Body** → Select file
4. Click **Send**

**Expected Response:**
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

**✓ Success indicators:**
- `rollbackExecuted`: **true**
- `status`: **"ROLLBACK"**
- `rollbackCount`: >= 1

---

### 💥 Test 3: Database Error → Full Rollback

**Mục đích:** Test rollback khi database fail

**Scenario:**
- ✓ Step 1: Create metadata (SUCCESS)
- ✓ Step 2: Upload file (SUCCESS)
- ✗ Step 3: Update status (FAIL - simulated)
- → Rollback: Delete file + metadata

**Steps:**

1. Mở folder **"2. Rollback Scenarios"**
2. Click **"Test Database Error"**
3. Tab **Body** → Select file
4. Click **Send**

**Expected Response:**
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

**✓ Success indicators:**
- `rollbackExecuted`: **true**
- `status`: **"ROLLBACK"** hoặc **"FAILED"**

---

## Bước 5: Verify Results (Kiểm tra kết quả)

### 5.1 Get User Files

**Xem tất cả files của một user:**

1. Mở folder **"3. Monitoring"**
2. Click **"Get User Files"**
3. Trong URL, có thể thay đổi user ID:
   ```
   http://localhost:8081/api/test/saga/user-files/test-user-1
   ```
4. Click **Send**

**Expected Response:**
```json
{
  "userId": "test-user-1",
  "totalFiles": 3,
  "files": [
    {
      "id": 1,
      "userId": "test-user-1",
      "fileName": "abc.jpg",
      "uploadStatus": "UPLOADED",
      "createdAt": "2025-12-08T10:30:00"
    }
  ],
  "statusCounts": {
    "PENDING": 0,
    "UPLOADING": 0,
    "UPLOADED": 1,
    "FAILED": 1,
    "ROLLBACK": 1
  }
}
```

**Verify:**
- test-user-1 có file UPLOADED
- test-user-2 có file ROLLBACK
- test-user-3 có file ROLLBACK/FAILED

### 5.2 Get Error Flags

**Kiểm tra trạng thái error simulation:**

1. Click **"Get Error Flags"**
2. Click **Send**

**Response:**
```json
{
  "simulateFileServiceError": false,
  "simulateDatabaseError": false,
  "simulateNetworkTimeout": false
}
```

---

## Bước 6: Advanced Testing

### 6.1 Manual Error Flag Control

**Enable FileService Error:**
1. Folder **"4. Configuration"**
2. Click **"Set FileService Error Flag"**
3. Send → Bật simulation
4. Chạy lại Test 1 → Sẽ fail và rollback

**Reset Flags:**
1. Click **"Reset Error Flags"**
2. Send → Reset tất cả về false

### 6.2 Test Multiple Users

**Modify userId trong URL:**

**Test User 1:**
```
?userId=test-user-1
```

**Test User 2:**
```
?userId=test-user-2
```

**Hoặc test với real user:**
```
?userId=your-real-user-id
```

---

## Bước 7: Cleanup Test Data

**Sau khi test xong, cleanup:**

1. Mở folder **"5. Cleanup"**
2. Click **"Cleanup Test User 1"**
3. Send
4. Lặp lại cho User 2, User 3

**Expected Response:**
```json
{
  "userId": "test-user-1",
  "deletedCount": 3,
  "message": "Test data cleaned up successfully"
}
```

**Verify cleanup:**
- Chạy lại "Get User Files"
- Should return: `"totalFiles": 0`

---

## 🎯 Quick Test Flow (Recommended)

### Flow 1: Test All Scenarios (5 phút)

```
1. Upload Success           → Expect: UPLOADED
2. Test FileService Error   → Expect: ROLLBACK
3. Test Database Error      → Expect: ROLLBACK
4. Get User Files (user-1)  → Verify: 1 UPLOADED
5. Get User Files (user-2)  → Verify: 1 ROLLBACK
6. Get User Files (user-3)  → Verify: 1 ROLLBACK
7. Cleanup All             → Delete test data
```

### Flow 2: Detailed Testing (10 phút)

```
1. Get Error Flags          → Verify all false
2. Upload Success           → Test normal flow
3. Get User Files           → Verify UPLOADED
4. Set FileService Error    → Enable simulation
5. Upload Success           → Should fail now
6. Reset Error Flags        → Disable simulation
7. Test Database Error      → Test full rollback
8. Get User Files           → Verify all statuses
9. Cleanup                  → Clean all users
```

---

## 📊 Understanding Responses

### Success Response Structure
```json
{
  "id": <number>,              // File metadata ID
  "userId": <string>,          // User ID
  "fileName": <string>,        // Stored file name
  "originalFileName": <string>, // Original file name
  "fileSize": <number>,        // File size in bytes
  "fileType": <string>,        // MIME type
  "fileUrl": <string>,         // File URL
  "status": "UPLOADED",        // Upload status
  "message": <string>          // Success message
}
```

### Rollback Response Structure
```json
{
  "testScenario": <string>,         // Scenario being tested
  "expectedBehavior": <string>,     // What should happen
  "uploadResponse": {
    "id": <number>,
    "userId": <string>,
    "status": "ROLLBACK",           // Rollback status
    "message": <string>             // Error message
  },
  "status": "ROLLBACK",
  "rollbackExecuted": true,         // Rollback flag
  "rollbackCount": <number>,        // Number of rollbacks
  "message": <string>
}
```

---

## 🔍 Troubleshooting trong Postman

### Error: "Could not send request"

**Nguyên nhân:** UserService không chạy

**Fix:**
```bash
cd F:\cnweb_20251\backend\user-service
mvn spring-boot:run
```

### Error: 404 Not Found

**Nguyên nhân:** Sai URL hoặc endpoint

**Fix:** 
- Check URL: `http://localhost:8081/api/test/saga/...`
- Check port: 8081 (default cho UserService)

### Error: 500 Internal Server Error

**Nguyên nhân:** Database issue hoặc service error

**Fix:**
1. Check logs trong terminal
2. Verify database đang chạy
3. Check table `user_file_metadata` đã tạo chưa

### File upload không hoạt động

**Fix:**
1. Verify file đã chọn đúng trong Body → form-data
2. Key phải là `file` (lowercase)
3. Type phải là `File` (không phải Text)

---

## 💡 Tips & Best Practices

### 1. Organize Collections

**Create Environment:**
```
Name: Saga Testing Local
Variables:
  - baseUrl: http://localhost:8081
  - testUser1: test-user-1
  - testUser2: test-user-2
```

**Update URLs:**
```
{{baseUrl}}/api/test/saga/upload-success?userId={{testUser1}}
```

### 2. Save Responses

**Enable Save Responses:**
- Click "Save Response" button
- Useful để compare results

### 3. Use Tests Tab

**Add test scripts:**
```javascript
// Test success upload
pm.test("Upload successful", function() {
    pm.response.to.have.status(200);
    var json = pm.response.json();
    pm.expect(json.status).to.eql("UPLOADED");
});

// Test rollback
pm.test("Rollback executed", function() {
    var json = pm.response.json();
    pm.expect(json.rollbackExecuted).to.be.true;
});
```

### 4. Run Collection

**Runner:**
1. Click "..." → Run collection
2. Select all requests
3. Click "Run Saga Rollback Testing"
4. View results summary

---

## 📸 Expected Screenshots

### Success Upload
```
POST /api/test/saga/upload-success
Status: 200 OK ✓
Body: {
  "status": "UPLOADED" ✓
  "message": "File uploaded successfully" ✓
}
```

### Rollback Scenario
```
POST /api/test/saga/test-fileservice-error
Status: 200 OK ✓
Body: {
  "rollbackExecuted": true ✓
  "status": "ROLLBACK" ✓
}
```

### Get User Files
```
GET /api/test/saga/user-files/test-user-1
Status: 200 OK ✓
Body: {
  "totalFiles": 1 ✓
  "statusCounts": {
    "UPLOADED": 1 ✓
  }
}
```

---

## 🎓 Next Steps

1. ✅ Test tất cả scenarios
2. ✅ Verify responses
3. 📝 Document kết quả
4. 🔍 Check database để verify
5. 🧪 Thử modify code và test lại
6. 📊 Monitor logs để understand flow

Happy Testing với Postman! 🚀
