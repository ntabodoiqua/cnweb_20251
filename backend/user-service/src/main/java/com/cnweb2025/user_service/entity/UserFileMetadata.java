package com.cnweb2025.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity để lưu metadata của file được upload bởi user
 * Sử dụng trong Saga pattern để theo dõi trạng thái upload
 */
@Entity
@Table(name = "user_file_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFileMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "original_file_name")
    private String originalFileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_type")
    private String fileType;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "upload_status", nullable = false)
    private UploadStatus uploadStatus;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (uploadStatus == null) {
            uploadStatus = UploadStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum UploadStatus {
        PENDING,        // Metadata đã tạo, chưa upload
        UPLOADING,      // Đang upload
        UPLOADED,       // Upload thành công
        FAILED,         // Upload thất bại
        ROLLBACK        // Đã rollback
    }
}
