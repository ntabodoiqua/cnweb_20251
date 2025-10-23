package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.Address;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, String> {
    // Tìm xem người dùng đã có địa chỉ mặc định chưa
    @Query(
            nativeQuery = true,
            value = "SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END " +
                    "FROM address WHERE user_id = :id AND is_default = :isDefault"
    )
    Boolean existsByUserIdAndIsDefault(@Param("id") String id, @Param("isDefault") boolean isDefault);

    @Modifying
    @Transactional
    @Query(value = "UPDATE address SET is_default = false WHERE user_id = :userId", nativeQuery = true)
    void resetDefaultAddress(@Param("userId") String userId);
}
