-- ==========================================
-- SQL QUERIES ĐỂ KIỂM TRA SOFT DELETE FEATURE
-- ==========================================

-- ==========================================
-- 1. KIỂM TRA CẤU TRÚC BẢNG
-- ==========================================

-- Xem các cột của bảng users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('deleted', 'deleted_at', 'enabled')
ORDER BY ordinal_position;

-- Kết quả mong đợi:
-- deleted    | boolean   | NO  | false
-- deleted_at | timestamp | YES | NULL
-- enabled    | boolean   | NO  | true


-- ==========================================
-- 2. KIỂM TRA DỮ LIỆU SOFT DELETE
-- ==========================================

-- Xem tất cả users đã soft delete
SELECT
    id,
    username,
    email,
    enabled,
    deleted,
    deleted_at,
    created_at,
    CASE
        WHEN deleted_at IS NOT NULL THEN
            EXTRACT(DAY FROM (NOW() - deleted_at))
        ELSE NULL
    END as days_since_deleted
FROM users
WHERE deleted = true
ORDER BY deleted_at DESC;


-- Xem chi tiết một user cụ thể (thay YOUR_USERNAME)
SELECT
    id,
    username,
    email,
    phone,
    enabled,
    is_verified,
    deleted,
    deleted_at,
    created_at,
    updated_at
FROM users
WHERE username = 'YOUR_USERNAME';


-- ==========================================
-- 3. THỐNG KÊ
-- ==========================================

-- Đếm số lượng users theo trạng thái
SELECT
    COUNT(*) as total_users,
    SUM(CASE WHEN enabled = true THEN 1 ELSE 0 END) as enabled_users,
    SUM(CASE WHEN enabled = false THEN 1 ELSE 0 END) as disabled_users,
    SUM(CASE WHEN deleted = true THEN 1 ELSE 0 END) as soft_deleted_users,
    SUM(CASE WHEN deleted = false THEN 1 ELSE 0 END) as active_users
FROM users;


-- Xem users soft deleted theo ngày
SELECT
    DATE(deleted_at) as deleted_date,
    COUNT(*) as count
FROM users
WHERE deleted = true
GROUP BY DATE(deleted_at)
ORDER BY deleted_date DESC;


-- ==========================================
-- 4. KIỂM TRA USERS SẮP BỊ HARD DELETE
-- ==========================================

-- Users sẽ bị hard delete trong 30 ngày
SELECT
    id,
    username,
    email,
    deleted_at,
    deleted_at + INTERVAL '30 days' as will_be_hard_deleted_at,
    EXTRACT(DAY FROM (NOW() - deleted_at)) as days_since_deleted,
    30 - EXTRACT(DAY FROM (NOW() - deleted_at)) as days_until_hard_delete
FROM users
WHERE deleted = true
  AND deleted_at IS NOT NULL
ORDER BY deleted_at ASC;


-- Users đủ điều kiện hard delete (> 30 ngày)
SELECT
    id,
    username,
    email,
    deleted_at,
    EXTRACT(DAY FROM (NOW() - deleted_at)) as days_since_deleted
FROM users
WHERE deleted = true
  AND deleted_at < NOW() - INTERVAL '30 days'
ORDER BY deleted_at ASC;


-- ==========================================
-- 5. KIỂM TRA INDEXES (PERFORMANCE)
-- ==========================================

-- Xem indexes trên bảng users
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users'
  AND (indexname LIKE '%deleted%' OR indexdef LIKE '%deleted%')
ORDER BY indexname;


-- ==========================================
-- 6. TEST DATA - TẠO USER ĐỂ TEST
-- ==========================================

-- Tạo user test (chỉ dùng để test)
-- INSERT INTO users (id, username, email, phone, password, first_name, last_name, enabled, is_verified, deleted, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'test_soft_delete',
--     'test_soft_delete@example.com',
--     '0999999999',
--     '$2a$10$xHhhPe6ppZBJQGMlgOxnQefWHQfmhCGZlXZ/T5L0KNXQfJB9J9K8C', -- password: Test@123456
--     'Test',
--     'SoftDelete',
--     true,
--     true,
--     false,
--     NOW(),
--     NOW()
-- );


-- ==========================================
-- 7. SIMULATE SCHEDULER - TEST HARD DELETE
-- ==========================================

-- CẢNH BÁO: Chỉ chạy trong môi trường TEST!
-- Cập nhật deleted_at về 31 ngày trước để test scheduler

-- Xem users sẽ bị ảnh hưởng trước
SELECT id, username, email, deleted_at
FROM users
WHERE username LIKE 'test%'
  AND deleted = true;

-- Cập nhật deleted_at (chỉ cho test users)
-- UPDATE users
-- SET deleted_at = NOW() - INTERVAL '31 days'
-- WHERE username LIKE 'test_soft_delete%'
--   AND deleted = true;


-- ==========================================
-- 8. ROLLBACK / RESTORE USER MANUALLY
-- ==========================================

-- Restore một user cụ thể (manual)
-- UPDATE users
-- SET
--     deleted = false,
--     deleted_at = NULL,
--     enabled = true,
--     updated_at = NOW()
-- WHERE username = 'YOUR_USERNAME'
--   AND deleted = true;


-- ==========================================
-- 9. CLEANUP TEST DATA
-- ==========================================

-- Xóa tất cả test users (sau khi test xong)
-- DELETE FROM users
-- WHERE username LIKE 'test%'
--   OR email LIKE 'test%';


-- ==========================================
-- 10. MONITORING QUERIES
-- ==========================================

-- Query để chạy định kỳ monitor soft deleted users
SELECT
    'Soft Deleted Users' as metric,
    COUNT(*) as value,
    NOW() as checked_at
FROM users
WHERE deleted = true

UNION ALL

SELECT
    'Users Ready for Hard Delete' as metric,
    COUNT(*) as value,
    NOW() as checked_at
FROM users
WHERE deleted = true
  AND deleted_at < NOW() - INTERVAL '30 days'

UNION ALL

SELECT
    'Total Users' as metric,
    COUNT(*) as value,
    NOW() as checked_at
FROM users;


-- ==========================================
-- 11. KIỂM TRA RELATED DATA
-- ==========================================

-- Kiểm tra xem user có data liên quan không trước khi hard delete
-- (Thay YOUR_USER_ID)

-- Addresses
SELECT COUNT(*) as addresses_count
FROM addresses
WHERE user_id = 'YOUR_USER_ID';

-- Seller Profiles
SELECT COUNT(*) as seller_profiles_count
FROM seller_profiles
WHERE user_id = 'YOUR_USER_ID';

-- Login History
SELECT COUNT(*) as login_history_count
FROM login_histories
WHERE user_id = 'YOUR_USER_ID';

-- User Roles
SELECT COUNT(*) as roles_count
FROM user_role
WHERE user_id = 'YOUR_USER_ID';


-- ==========================================
-- 12. AUDIT LOG (Optional)
-- ==========================================

-- Nếu có audit log table, có thể query để xem history
-- SELECT * FROM audit_log
-- WHERE entity_type = 'USER'
--   AND entity_id = 'YOUR_USER_ID'
--   AND action IN ('SOFT_DELETE', 'HARD_DELETE', 'RESTORE')
-- ORDER BY created_at DESC;


-- ==========================================
-- KẾT LUẬN
-- ==========================================

-- Checklist để verify soft delete feature:
-- ✅ Columns 'deleted' và 'deleted_at' tồn tại
-- ✅ Users có thể được soft delete (deleted = true)
-- ✅ deleted_at được set khi soft delete
-- ✅ enabled = false khi soft delete
-- ✅ Có thể restore user (set deleted = false)
-- ✅ Users > 30 ngày sẽ bị hard delete
-- ✅ Indexes tồn tại để optimize query

-- Để chạy các query trên:
-- psql -h <host> -U <user> -d user_service -f check_soft_delete.sql

