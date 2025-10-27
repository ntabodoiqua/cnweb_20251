package com.vdt2025.file_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "uploaded_files")
@Entity
public class UploadedFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "file_name", nullable = false, unique = true)
    String fileName;

    @Column(name = "original_file_name", nullable = false)
    String originalFileName;

    @Column(name = "file_type", nullable = false)
    String fileType;

    @Column(name = "file_size", nullable = false)
    Long fileSize;

    @Column(name = "uploaded_at", nullable = false)
    LocalDateTime uploadedAt;

    @Column(name = "uploaded_by", nullable = false)
    String uploadedBy; // Username của người upload

    @Column(name = "uploaded_by_id", nullable = false)
    String uploadedById; // User ID của người upload

    @Column(name = "is_public", nullable = false)
    Boolean isPublic; // True = Public, False = Private

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    Boolean isDeleted = false; // True = File đã bị xóa khỏi S3, False = File còn tồn tại
    
    @Column(name = "deleted_at")
    LocalDateTime deletedAt; // Thời điểm file bị xóa
}
