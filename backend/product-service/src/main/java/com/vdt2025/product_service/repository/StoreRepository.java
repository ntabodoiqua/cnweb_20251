package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
}