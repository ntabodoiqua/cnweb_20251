package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.LoginHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, String> {
    // Lấy toàn bộ lịch sử đăng nhập của một người dùng theo userId
    Page<LoginHistory> findByUserId(String userId, Pageable pageable);
}
