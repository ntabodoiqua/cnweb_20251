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
}
