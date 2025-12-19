# User Soft Delete Feature Documentation

## Tổng quan
Tính năng Soft Delete cho phép người dùng xóa tài khoản của họ một cách an toàn. Tài khoản sẽ được đánh dấu là đã xóa (soft delete) và sau 30 ngày, dữ liệu sẽ được xóa hoàn toàn (hard delete).

## Kiến trúc

### 1. Database Changes
Đã thêm 2 cột mới vào bảng `users`:
- `deleted` (BOOLEAN): Đánh dấu user đã bị soft delete (mặc định FALSE)
- `deleted_at` (TIMESTAMP): Thời điểm user bị soft delete

### 2. Message Types
Đã thêm 2 loại message mới trong `MessageType`:
- `USER_SOFT_DELETED`: Được gửi khi user thực hiện soft delete
- `USER_HARD_DELETED`: Được gửi khi user bị hard delete sau 30 ngày

### 3. Event DTOs
- `UserSoftDeletedEvent`: Chứa thông tin user khi soft delete
- `UserHardDeletedEvent`: Chứa thông tin user khi hard delete

## Luồng hoạt động

### Soft Delete Flow
1. User gọi API `DELETE /users/soft-delete`
2. UserService đánh dấu user:
   - `deleted = true`
   - `deleted_at = current timestamp`
   - `enabled = false`
3. Gửi event `USER_SOFT_DELETED` qua RabbitMQ
4. Product-service nhận event và xử lý:
   - Disable/ẩn store của user
   - Không xóa dữ liệu

### Hard Delete Flow (Automatic)
1. Scheduler chạy mỗi ngày lúc 2h sáng
2. Tìm tất cả users có `deleted = true` và `deleted_at < (now - 30 days)`
3. Với mỗi user:
   - Gửi event `USER_HARD_DELETED` qua RabbitMQ
   - Đợi 5 giây cho các service xử lý
   - Xóa user khỏi database
4. Product-service nhận event:
   - Xóa hoàn toàn store và dữ liệu liên quan

## API Endpoints

### Soft Delete Account
```http
DELETE /users/soft-delete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 1000,
  "message": "Account soft deleted successfully",
  "result": "Account has been deleted. Your data will be permanently removed after 30 days. Contact support if you want to restore your account."
}
```

## Files Modified/Created

### User Service
- ✅ `User.java` - Added `deleted` and `deletedAt` fields
- ✅ `UserRepository.java` - Added query methods for soft delete
- ✅ `UserService.java` - Added `softDeleteMyAccount()` method
- ✅ `UserServiceImp.java` - Implemented soft delete logic
- ✅ `UserController.java` - Added endpoint `/soft-delete`
- ✅ `ErrorCode.java` - Added `USER_ALREADY_DELETED` error
- ✅ `UserCleanupScheduler.java` - Scheduled job for hard delete
- ✅ `messages_en.properties` - Added error message
- ✅ `messages_vi.properties` - Added Vietnamese error message
- ✅ `add_soft_delete_columns.sql` - Migration script

### Common DTO
- ✅ `MessageType.java` - Added USER_SOFT_DELETED and USER_HARD_DELETED
- ✅ `UserSoftDeletedEvent.java` - Event DTO for soft delete
- ✅ `UserHardDeletedEvent.java` - Event DTO for hard delete

### Product Service
- ✅ `UserDeletionEventHandler.java` - Handler for user deletion events
- ✅ `ProductServiceApplication.java` - Added @EnableScheduling

## Configuration

### Scheduler Cron Expressions
- Hard Delete Job: `0 0 2 * * ?` (Every day at 2:00 AM)
- Monitoring Job: `0 0 * * * ?` (Every hour)

### RabbitMQ Queues
- `user-soft-deleted-queue`: Queue for soft delete events
- `user-hard-deleted-queue`: Queue for hard delete events

## Testing

### Manual Testing Steps

1. **Test Soft Delete:**
```bash
# Login as user
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password"}'

# Soft delete account
curl -X DELETE http://localhost:8081/users/soft-delete \
  -H "Authorization: Bearer <token>"

# Verify user is deleted
# Try to login - should fail
```

2. **Test Scheduler (Manual Trigger):**
```sql
-- Set deleted_at to 31 days ago for testing
UPDATE users 
SET deleted_at = NOW() - INTERVAL '31 days'
WHERE username = 'testuser';

-- Wait for scheduler to run at 2 AM or trigger manually
-- User should be hard deleted
```

3. **Check Database:**
```sql
-- View soft deleted users
SELECT id, username, email, deleted, deleted_at 
FROM users 
WHERE deleted = true;

-- Count soft deleted users
SELECT COUNT(*) FROM users WHERE deleted = true;
```

## Future Improvements

1. **Restore Feature**: Cho phép user khôi phục tài khoản trong vòng 30 ngày
2. **Admin Override**: Admin có thể hard delete ngay lập tức
3. **Notification**: Gửi email nhắc nhở trước khi hard delete
4. **Cascade Delete**: Tự động xóa dữ liệu ở các service khác
5. **Audit Log**: Ghi log chi tiết về việc xóa user

## Notes

- Soft delete tự động disable account (`enabled = false`)
- Hard delete xóa hoàn toàn user và tất cả dữ liệu liên quan
- Scheduler chạy với timezone của server
- RabbitMQ event có retry mechanism nếu xử lý thất bại
- Nên backup database trước khi deploy tính năng này

## Rollback Plan

Nếu có vấn đề, có thể rollback bằng cách:

1. Remove endpoint từ UserController
2. Comment out scheduler
3. Không cần xóa columns `deleted` và `deleted_at` (để FALSE là được)

## Contact

Nếu có vấn đề, liên hệ team backend để được hỗ trợ.

