package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User>  {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndEnabledTrueAndIsVerifiedTrue(String username);

    Optional<User> findByIdAndEnabledTrueAndIsVerifiedTrue(String id);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    // Query để lấy tất cả avatar names
    @Query(
        value = "SELECT avatar_name FROM users WHERE avatar_name IS NOT NULL",
        nativeQuery = true
    )
    List<String> findAllAvatarNames();

    // Tổng số người dùng đang hoạt động
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    long countEnabledUsers();

    // Tổng số người dùng bị vô hiệu hóa
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = false")
    long countDisabledUsers();

    // Đếm số lượng người dùng theo vai trò
    @Query("SELECT r.name, COUNT(u) FROM User u JOIN u.roles r GROUP BY r.name")
    List<Object[]> countUsersByRole();

    // Đếm người dùng theo tháng tạo tài khoản
    @Query("""
       SELECT MONTH(u.createdAt) AS month, COUNT(u)
       FROM User u
       WHERE YEAR(u.createdAt) = YEAR(CURRENT_DATE)
       GROUP BY MONTH(u.createdAt)
       ORDER BY MONTH(u.createdAt)
       """)
    List<Object[]> countUsersByCreatedMonth();

    // ============== Soft Delete Methods ==============

    // Tìm user theo ID và chưa bị xóa
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deleted = false")
    Optional<User> findByIdAndNotDeleted(@Param("id") String id);

    // Tìm user theo username và chưa bị xóa
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.deleted = false")
    Optional<User> findByUsernameAndNotDeleted(@Param("username") String username);

    // Tìm tất cả users đã soft delete trước một thời điểm
    @Query("SELECT u FROM User u WHERE u.deleted = true AND u.deletedAt < :cutoffDate")
    List<User> findSoftDeletedUsersBeforeDate(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Hard delete users đã soft delete trước một thời điểm
    @Modifying
    @Query("DELETE FROM User u WHERE u.deleted = true AND u.deletedAt < :cutoffDate")
    int hardDeleteSoftDeletedUsersBeforeDate(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Đếm số lượng users đã soft delete
    @Query("SELECT COUNT(u) FROM User u WHERE u.deleted = true")
    long countSoftDeletedUsers();

}
