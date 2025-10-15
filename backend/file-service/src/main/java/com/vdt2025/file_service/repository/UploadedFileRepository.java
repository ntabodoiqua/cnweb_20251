package com.vdt2025.file_service.repository;

import com.vdt2025.file_service.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, String> {
    Optional<UploadedFile> findByFileName(String fileName);
}
