package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.UserFileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFileMetadataRepository extends JpaRepository<UserFileMetadata, Long> {
    
    List<UserFileMetadata> findByUserId(String userId);
    
    Optional<UserFileMetadata> findByIdAndUserId(Long id, String userId);
    
    List<UserFileMetadata> findByUploadStatus(UserFileMetadata.UploadStatus status);
}
