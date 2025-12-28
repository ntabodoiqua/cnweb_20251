package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, String> {
    Optional<Store> findByUserName(String userId);
    Optional<Store> findBySellerProfileId(String sellerProfileId);
    boolean existsByUserName(String userId);
    boolean existsBySellerProfileId(String sellerProfileId);
    Page<Store> findAllByUserName(String username, Pageable pageable);
    boolean existsByIdAndUserNameIgnoreCase(String id, String userName);
    Page<Store> findAllByIsActiveTrue(Pageable pageable);

    /**
     * Cập nhật total sold count của store
     */
    @Modifying
    @Query("UPDATE Store s SET s.totalSold = s.totalSold + :quantity WHERE s.id = :storeId")
    int updateTotalSold(@Param("storeId") String storeId, @Param("quantity") Integer quantity);

    /**
     * Đếm số store đang active
     */
    long countByIsActiveTrue();
}