# HƯỚNG DẪN KIỂM TRA TÍNH NĂNG SOFT DELETE USER

## 📋 Checklist Kiểm Tra

### ✅ Bước 1: Khởi động các services

#### 1.1 Build common-dto (Quan trọng!)
```powershell
cd C:\Users\Admin\WebstormProjects\cnweb_20251\backend\common-dto
.\mvnw.cmd clean install -DskipTests
```

#### 1.2 Khởi động User Service
```powershell
cd C:\Users\Admin\WebstormProjects\cnweb_20251\backend\user-service
.\mvnw.cmd spring-boot:run
```

#### 1.3 Khởi động Product Service
```powershell
cd C:\Users\Admin\WebstormProjects\cnweb_20251\backend\product-service
.\mvnw.cmd spring-boot:run
```

**Chờ cả 2 services khởi động thành công!**

---

## 🧪 PHẦN 1: TEST SOFT DELETE FLOW

### Test 1: Tạo User Mới (Nếu chưa có)

**Request:**
```powershell
$createUserBody = @{
    username = "testuser_delete"
    password = "Test@123456"
    email = "testdelete@example.com"
    phone = "0999888777"
    firstName = "Test"
    lastName = "Delete"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/users" `
    -Method POST `
    -ContentType "application/json" `
    -Body $createUserBody
```

### Test 2: Verify Email (Bỏ qua nếu không bắt buộc)

### Test 3: Login để lấy Token

**Request:**
```powershell
$loginBody = @{
    username = "testuser_delete"
    password = "Test@123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.result.token
Write-Host "Token: $token"
```

**Lưu token để dùng cho các bước tiếp theo!**

### Test 4: Kiểm tra thông tin user hiện tại

**Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/users/myInfo" `
    -Method GET `
    -Headers @{Authorization = "Bearer $token"}
```

**Kết quả mong đợi:**
- ✅ Trả về thông tin user
- ✅ `deleted` = false hoặc không có field này

### Test 5: ⭐ SOFT DELETE ACCOUNT (Tính năng mới!)

**Request:**
```powershell
$softDeleteResponse = Invoke-RestMethod -Uri "http://localhost:8081/users/soft-delete" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $token"}

Write-Host "Soft Delete Response:"
$softDeleteResponse | ConvertTo-Json
```

**Kết quả mong đợi:**
```json
{
  "code": 1000,
  "message": "Account soft deleted successfully",
  "result": "Account has been deleted. Your data will be permanently removed after 30 days..."
}
```

**Kiểm tra logs:**
- User-service log: "User testuser_delete soft deleted their account successfully"
- RabbitMQ: Event USER_SOFT_DELETED được publish

### Test 6: Thử login lại sau khi soft delete

**Request:**
```powershell
try {
    $loginBody = @{
        username = "testuser_delete"
        password = "Test@123456"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
} catch {
    Write-Host "Expected error: User is disabled or deleted"
    $_.Exception.Response.StatusCode
}
```

**Kết quả mong đợi:**
- ❌ Login thất bại
- Error: User is disabled

### Test 7: Kiểm tra Database

**Chạy SQL query:**
```sql
-- Kiểm tra user đã soft delete
SELECT id, username, email, enabled, deleted, deleted_at 
FROM users 
WHERE username = 'testuser_delete';
```

**Kết quả mong đợi:**
- `enabled` = false
- `deleted` = true
- `deleted_at` = (timestamp hiện tại)

---

## 🔐 PHẦN 2: TEST ADMIN FUNCTIONS

### Test 8: Login as Admin

**Request:**
```powershell
$adminLoginBody = @{
    username = "admin"
    password = "admin"
} | ConvertTo-Json

$adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $adminLoginBody

$adminToken = $adminLoginResponse.result.token
Write-Host "Admin Token: $adminToken"
```

### Test 9: ⭐ Xem danh sách Soft Deleted Users (Tính năng mới!)

**Request:**
```powershell
$softDeletedUsers = Invoke-RestMethod -Uri "http://localhost:8081/admin/users/soft-deleted" `
    -Method GET `
    -Headers @{Authorization = "Bearer $adminToken"}

Write-Host "Soft Deleted Users:"
$softDeletedUsers.result | Format-Table
```

**Kết quả mong đợi:**
- ✅ Danh sách chứa user vừa soft delete
- ✅ Có thông tin: username, email, deleted_at

### Test 10: ⭐ Đếm số lượng Soft Deleted Users (Tính năng mới!)

**Request:**
```powershell
$count = Invoke-RestMethod -Uri "http://localhost:8081/admin/users/soft-deleted/count" `
    -Method GET `
    -Headers @{Authorization = "Bearer $adminToken"}

Write-Host "Count: $($count.result)"
```

**Kết quả mong đợi:**
- ✅ Số lượng >= 1

### Test 11: ⭐ Restore User (Tính năng mới!)

**Lấy userId từ Test 9, sau đó:**

**Request:**
```powershell
# Thay YOUR_USER_ID bằng ID thực tế
$userId = "YOUR_USER_ID"

$restoreResponse = Invoke-RestMethod -Uri "http://localhost:8081/admin/users/$userId/restore" `
    -Method PUT `
    -Headers @{Authorization = "Bearer $adminToken"}

Write-Host "Restore Response:"
$restoreResponse | ConvertTo-Json
```

**Kết quả mong đợi:**
```json
{
  "code": 1000,
  "message": "User restored successfully",
  "result": "User restored successfully"
}
```

### Test 12: Verify User Restored

**Kiểm tra database:**
```sql
SELECT id, username, email, enabled, deleted, deleted_at 
FROM users 
WHERE username = 'testuser_delete';
```

**Kết quả mong đợi:**
- `enabled` = true
- `deleted` = false
- `deleted_at` = null

**Thử login lại:**
```powershell
$loginBody = @{
    username = "testuser_delete"
    password = "Test@123456"
} | ConvertTo-Json

$loginAfterRestore = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Login successful after restore!"
```

---

## ⏰ PHẦN 3: TEST SCHEDULER (Hard Delete)

### Test 13: Kiểm tra Scheduler Log

**Xem logs của User Service:**
- Tìm dòng: "Starting scheduled hard delete..."
- Scheduler chạy mỗi ngày lúc 2h sáng

### Test 14: Test Scheduler Manually (CÁCH 1 - SQL)

**Cập nhật deleted_at về 31 ngày trước:**
```sql
UPDATE users 
SET deleted_at = NOW() - INTERVAL '31 days'
WHERE username = 'testuser_delete' AND deleted = true;
```

**Sau đó đợi đến 2h sáng hoặc restart service để trigger scheduler**

### Test 15: Test Scheduler Manually (CÁCH 2 - Code)

**Tạo endpoint test trong UserController (Development only):**

```java
// Thêm vào UserController.java
@PostMapping("/test/trigger-hard-delete")
@PreAuthorize("hasRole('ADMIN')")
public ApiResponse<String> triggerHardDeleteForTesting() {
    // Inject UserCleanupScheduler
    userCleanupScheduler.hardDeleteOldSoftDeletedUsers();
    return ApiResponse.<String>builder()
            .message("Scheduler triggered manually")
            .result("Check logs for results")
            .build();
}
```

**Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/users/test/trigger-hard-delete" `
    -Method POST `
    -Headers @{Authorization = "Bearer $adminToken"}
```

### Test 16: Verify Hard Delete

**Kiểm tra database:**
```sql
-- User nên bị xóa hoàn toàn
SELECT * FROM users WHERE username = 'testuser_delete';
```

**Kết quả mong đợi:**
- ❌ Không tìm thấy user (đã bị xóa vĩnh viễn)

**Kiểm tra logs:**
- User-service: "Successfully hard deleted X users"
- Product-service: "Received USER_HARD_DELETED event"

---

## 🐰 PHẦN 4: TEST RABBITMQ INTEGRATION

### Test 17: Kiểm tra RabbitMQ Queues

**Truy cập RabbitMQ Management UI:**
```
URL: https://fuji.lmq.cloudamqp.com
Username: xqjmojji
Password: hn8Iv-4Aa0YFZRmZuLtz6jMB0xoZl8TH
```

**Kiểm tra các queues:**
- ✅ `user-soft-deleted-queue` - should exist
- ✅ `user-hard-deleted-queue` - should exist

**Kiểm tra messages:**
- Khi soft delete user → message xuất hiện trong queue
- Product-service consume message

### Test 18: Kiểm tra Product Service Handler

**Tạo store cho user trước:**
```powershell
# Login as user, create seller profile, wait for approval, store created
# Then soft delete user
```

**Xem logs của Product Service:**
```
INFO - Received USER_SOFT_DELETED event for user: testuser_delete
INFO - Store <store-id> of user <user-id> should be disabled/hidden
INFO - Successfully processed USER_SOFT_DELETED event
```

**Khi hard delete:**
```
INFO - Received USER_HARD_DELETED event for user: testuser_delete
INFO - Deleting store <store-id> of user <user-id>
INFO - Successfully deleted store
```

---

## 📊 PHẦN 5: MONITORING & LOGS

### Test 19: Kiểm tra Monitoring Job

**Scheduler chạy mỗi giờ để log số lượng soft deleted users**

**Xem logs:**
```
INFO - Current soft-deleted users count: X
```

### Test 20: Error Handling

**Test các trường hợp lỗi:**

**1. Soft delete user đã bị xóa:**
```powershell
# Soft delete 2 lần
Invoke-RestMethod -Uri "http://localhost:8081/users/soft-delete" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $token"}
```

**Kết quả mong đợi:**
- Error code: 1215
- Message: "User account has already been deleted"

**2. Restore user chưa bị soft delete:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/admin/users/$normalUserId/restore" `
    -Method PUT `
    -Headers @{Authorization = "Bearer $adminToken"}
```

**Kết quả mong đợi:**
- Error: User not found (vì không tìm thấy trong soft deleted users)

---

## 🎯 CHECKLIST TỔNG HỢP

### User Features
- [ ] User có thể soft delete account
- [ ] User không thể login sau khi soft delete
- [ ] Token cũ không còn valid
- [ ] Database có đánh dấu deleted = true

### Admin Features
- [ ] Admin xem được danh sách soft deleted users
- [ ] Admin xem được số lượng soft deleted users
- [ ] Admin có thể restore user
- [ ] User sau khi restore có thể login lại

### Scheduler Features
- [ ] Scheduler chạy đúng lịch (2h sáng)
- [ ] Hard delete users sau 30 ngày
- [ ] Logs ghi đầy đủ thông tin
- [ ] Monitoring job hoạt động

### RabbitMQ Integration
- [ ] Event USER_SOFT_DELETED được publish
- [ ] Event USER_HARD_DELETED được publish
- [ ] Product-service nhận được events
- [ ] Store bị xóa khi user hard deleted

### Error Handling
- [ ] Không thể soft delete 2 lần
- [ ] Không thể restore user không tồn tại
- [ ] Error messages đúng ngôn ngữ (EN/VI)

---

## 🐛 TROUBLESHOOTING

### Vấn đề 1: User-service không khởi động
```
Error: Could not find or load main class...
```
**Giải pháp:**
```powershell
cd backend\common-dto
.\mvnw.cmd clean install -DskipTests
```

### Vấn đề 2: RabbitMQ connection failed
```
Error: Connection refused
```
**Giải pháp:**
- Kiểm tra credentials trong application.yaml
- Kiểm tra network/firewall

### Vấn đề 3: Scheduler không chạy
```
No logs about scheduler
```
**Giải pháp:**
- Kiểm tra @EnableScheduling trong Application.java
- Kiểm tra timezone của server
- Xem logs có error không

### Vấn đề 4: Product-service không nhận event
```
Event published but not consumed
```
**Giải pháp:**
- Kiểm tra RabbitMQ queue tồn tại
- Kiểm tra binding đúng routing key
- Restart product-service

---

## 📝 GHI CHÚ

1. **Testing Environment**: Nên test trên môi trường dev/staging trước
2. **Database Backup**: Backup database trước khi test hard delete
3. **Scheduler**: Có thể thay đổi cron expression để test nhanh hơn
4. **Logs**: Theo dõi logs của cả 2 services
5. **RabbitMQ**: Kiểm tra messages trong queue nếu có vấn đề

---

## ✅ KẾT LUẬN

Sau khi hoàn thành tất cả test cases trên, bạn đã verify đầy đủ:
- ✅ Soft delete flow hoạt động
- ✅ Admin management features
- ✅ Scheduler tự động hard delete
- ✅ RabbitMQ integration
- ✅ Error handling

**Tính năng đã sẵn sàng để deploy!** 🚀

