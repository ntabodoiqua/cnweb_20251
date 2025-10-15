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
@Entity
public class UploadedFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false, unique = true)
    String fileName;
    String originalFileName;
    String fileType;
    Long fileSize;
    LocalDateTime uploadedAt;

    // Mối quan hệ với User
    String uploadedBy;
}
