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

    @Query(value = """
    SELECT jsonb_build_object(
          'totalUsers', COUNT(*),
          'enabledUsers', SUM(CASE WHEN enabled = true THEN 1 ELSE 0 END),
          'disabledUsers', SUM(CASE WHEN enabled = false THEN 1 ELSE 0 END),
          'maleUsers', SUM(CASE WHEN gender = 'MALE' THEN 1 ELSE 0 END),
          'femaleUsers', SUM(CASE WHEN gender = 'FEMALE' THEN 1 ELSE 0 END),
          'otherUsers', SUM(CASE WHEN gender = 'OTHER' THEN 1 ELSE 0 END),
          'usersByRole', (
              SELECT jsonb_object_agg(r.name, r.role_count)
              FROM (
                  SELECT r.name, COUNT(DISTINCT u.id) as role_count
                  FROM users u
                  JOIN user_role ur ON u.id = ur.user_id
                  JOIN role r ON ur.role_id = r.name 
                  GROUP BY r.name
              ) r
          ),
          'usersByMonth', (
              SELECT jsonb_object_agg(
                          CONCAT('Tháng ', month_num),
                          month_count
                      )
              FROM (
                  SELECT EXTRACT(MONTH FROM created_at) as month_num,
                         COUNT(*) as month_count
                  FROM users
                  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                  GROUP BY EXTRACT(MONTH FROM created_at)
                  ORDER BY month_num
              ) m
          )
      ) AS statistics
      FROM users;
    """, nativeQuery = true)
    String getUserStatisticsJson();
}
