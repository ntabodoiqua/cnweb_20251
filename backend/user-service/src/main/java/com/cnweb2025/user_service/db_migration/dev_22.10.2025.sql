
-- Tạo bảng mới "user_roles" để lưu trữ vai trò người dùng
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);