package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    @Query(value = "SELECT COUNT(*) FROM users WHERE role_id = :roleId", nativeQuery = true)
    Long countUsersWithRole(String roleId);
}
