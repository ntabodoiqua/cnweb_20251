package com.vdt2025.file_service.repository;

import com.vdt2025.file_service.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, String> {
    Optional<UploadedFile> findByFileName(String fileName);
    
    // Tìm các file được upload bởi user ID
    List<UploadedFile> findByUploadedById(String userId);
    
    // Tìm các file public
    List<UploadedFile> findByIsPublic(Boolean isPublic);
    
    // Tìm các file của user và public
    List<UploadedFile> findByUploadedByIdOrIsPublic(String userId, Boolean isPublic);
    
    // Tìm các file theo danh sách file names
    List<UploadedFile> findByFileNameIn(List<String> fileNames);
}
