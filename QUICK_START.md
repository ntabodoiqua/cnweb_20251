# 🚀 QUICK START - Kiểm Tra Tính Năng Soft Delete

## ⚡ Cách Nhanh Nhất Để Test

### Bước 1: Build common-dto (BẮT BUỘC!)
```powershell
cd C:\Users\Admin\WebstormProjects\cnweb_20251\backend\common-dto
.\mvnw.cmd clean install -DskipTests
```

### Bước 2: Khởi động services
```powershell
# Terminal 1 - User Service
cd C:\Users\Admin\WebstormProjects\cnweb_20251\backend\user-service
.\mvnw.cmd spring-boot:run

# Terminal 2 - Product Service  
cd C:\Users\Admin\WebstormProjects\cnweb_20251\backend\product-service
.\mvnw.cmd spring-boot:run
```

### Bước 3: Chạy test script tự động
```powershell
cd C:\Users\Admin\WebstormProjects\cnweb_20251
.\test-soft-delete.ps1
```

**Script sẽ tự động:**
- ✅ Tạo user test
- ✅ Login
- ✅ Soft delete account
- ✅ Verify không thể login
- ✅ Admin xem soft deleted users
- ✅ Admin restore user
- ✅ Verify login lại được

---

## 🎯 Hoặc Test Thủ Công Nhanh

### 1️⃣ Tạo user và login (Postman/Thunder Client)

**POST** `http://localhost:8081/users`
```json
{
  "username": "testdelete",
  "password": "Test@123456",
  "email": "testdelete@test.com",
  "phone": "0999888777",
  "firstName": "Test",
  "lastName": "Delete"
}
```

**POST** `http://localhost:8081/auth/login`
```json
{
  "username": "testdelete",
  "password": "Test@123456"
}
```
→ Lưu token

### 2️⃣ Soft Delete (Tính năng mới!)

**DELETE** `http://localhost:8081/users/soft-delete`  
Header: `Authorization: Bearer YOUR_TOKEN`

Kết quả:
```json
{
  "code": 1000,
  "message": "Account soft deleted successfully",
  "result": "Account has been deleted. Your data will be permanently removed after 30 days..."
}
```

### 3️⃣ Verify không thể login

**POST** `http://localhost:8081/auth/login`
```json
{
  "username": "testdelete",
  "password": "Test@123456"
}
```
→ Sẽ lỗi: User is disabled

### 4️⃣ Admin xem soft deleted users

**GET** `http://localhost:8081/admin/users/soft-deleted`  
Header: `Authorization: Bearer ADMIN_TOKEN`

### 5️⃣ Admin restore user

**PUT** `http://localhost:8081/admin/users/{userId}/restore`  
Header: `Authorization: Bearer ADMIN_TOKEN`

---

## 🔍 Kiểm Tra Database

Kết nối database và chạy:

```sql
-- Xem user đã soft delete
SELECT id, username, email, enabled, deleted, deleted_at 
FROM users 
WHERE username = 'testdelete';
```

Kết quả mong đợi sau soft delete:
- `enabled` = false
- `deleted` = true  
- `deleted_at` = (timestamp hiện tại)

---

## 📊 Kiểm Tra RabbitMQ

Truy cập: https://fuji.lmq.cloudamqp.com

Tìm queues:
- `user-soft-deleted-queue` - Có message khi soft delete
- `user-hard-deleted-queue` - Có message khi hard delete (sau 30 ngày)

---

## 📝 Kiểm Tra Logs

### User Service Log - Tìm các dòng:
```
INFO - User testdelete soft deleted their account successfully
INFO - Published USER_SOFT_DELETED event for user: testdelete
INFO - Starting scheduled hard delete... (chạy lúc 2h sáng)
```

### Product Service Log - Tìm các dòng:
```
INFO - Received USER_SOFT_DELETED event for user: testdelete
INFO - Store XXX of user YYY should be disabled/hidden
```

---

## ⏰ Test Scheduler (Hard Delete sau 30 ngày)

### Cách 1: Đợi đến 2h sáng
Scheduler tự động chạy

### Cách 2: Sửa deleted_at trong database
```sql
UPDATE users 
SET deleted_at = NOW() - INTERVAL '31 days'
WHERE username = 'testdelete' AND deleted = true;
```
Sau đó đợi đến 2h sáng hoặc restart service

### Cách 3: Trigger manual (nếu đã thêm endpoint test)
**POST** `http://localhost:8081/users/test/trigger-hard-delete`  
Header: `Authorization: Bearer ADMIN_TOKEN`

---

## ✅ Checklist Nhanh

Test cơ bản (5 phút):
- [ ] User có thể soft delete account
- [ ] Không thể login sau soft delete
- [ ] Database có `deleted = true`
- [ ] Admin xem được soft deleted users

Test đầy đủ (15 phút):
- [ ] User soft delete thành công
- [ ] RabbitMQ có event
- [ ] Product-service nhận event
- [ ] Admin restore user
- [ ] User login lại được sau restore
- [ ] Scheduler log hiển thị

---

## 🐛 Troubleshooting Nhanh

**Lỗi: Cannot find common-dto**
```powershell
cd backend\common-dto
.\mvnw.cmd clean install -DskipTests
```

**Lỗi: RabbitMQ connection refused**
→ Kiểm tra credentials trong application.yaml

**Lỗi: Scheduler không chạy**
→ Kiểm tra `@EnableScheduling` trong Application.java

**User-service không start**
→ Kiểm tra port 8081 có bị chiếm không

---

## 📖 Tài Liệu Chi Tiết

Xem thêm:
- `TESTING_GUIDE.md` - Hướng dẫn test chi tiết
- `SOFT_DELETE_FEATURE_README.md` - Technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Tổng kết implementation

---

## 🎉 Kết Luận

Sau khi test xong, bạn sẽ verify:
✅ Soft delete hoạt động đúng  
✅ Admin có thể quản lý soft deleted users  
✅ Scheduler tự động hard delete sau 30 ngày  
✅ RabbitMQ integration hoạt động  
✅ Product-service xử lý events đúng

**Chúc may mắn!** 🚀

