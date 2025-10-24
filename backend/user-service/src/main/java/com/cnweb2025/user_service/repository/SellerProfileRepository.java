package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, String> {
    Boolean existsByUserId(String userId);

    Optional<SellerProfile> findByUserId(String userId);

}
