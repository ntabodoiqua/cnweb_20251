package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.StoreFollow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreFollowRepository extends JpaRepository<StoreFollow, String> {
    
    /**
     * Kiểm tra user đã follow store chưa
     */
    boolean existsByUserIdAndStoreId(String userId, String storeId);
    
    /**
     * Tìm follow record theo userId và storeId
     */
    Optional<StoreFollow> findByUserIdAndStoreId(String userId, String storeId);
    
    /**
     * Xóa follow record theo userId và storeId
     */
    @Modifying
    void deleteByUserIdAndStoreId(String userId, String storeId);
    
    /**
     * Đếm số lượng follower của store
     */
    long countByStoreId(String storeId);
    
    /**
     * Lấy danh sách store mà user đang follow (phân trang)
     */
    @Query("SELECT sf FROM StoreFollow sf JOIN FETCH sf.store WHERE sf.userId = :userId ORDER BY sf.createdAt DESC")
    Page<StoreFollow> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId, Pageable pageable);
    
    /**
     * Lấy danh sách follower của store
     */
    @Query("SELECT sf.userId FROM StoreFollow sf WHERE sf.store.id = :storeId")
    List<String> findFollowerUserIdsByStoreId(@Param("storeId") String storeId);
    
    /**
     * Lấy danh sách storeId mà user đang follow
     */
    @Query("SELECT sf.store.id FROM StoreFollow sf WHERE sf.userId = :userId")
    List<String> findStoreIdsByUserId(@Param("userId") String userId);
}
