package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.SellerProfile;
import com.cnweb2025.user_service.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, String> {
    Boolean existsByUserId(String userId);

    Optional<SellerProfile> findByUserId(String userId);

    Boolean existsByUserIdAndVerificationStatusNot(String userId, VerificationStatus status);

    // Queries để lấy file references
    @Query(value = "SELECT document_name FROM seller_profile WHERE document_name IS NOT NULL", nativeQuery = true)
    List<String> findAllDocumentNames();

    @Query(value = "SELECT logo_name FROM seller_profile WHERE logo_name IS NOT NULL", nativeQuery = true)
    List<String> findAllLogoNames();

    @Query(value = "SELECT banner_name FROM seller_profile WHERE banner_name IS NOT NULL", nativeQuery = true)
    List<String> findAllBannerNames();
}
