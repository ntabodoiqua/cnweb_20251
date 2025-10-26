package com.vdt2025.file_service.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileInfoResponse {
    String fileName;
    String originalFileName;
    String fileType;
    Long fileSize;
    String fileUrl;
    Boolean isPublic;
    LocalDateTime uploadedAt;
    String uploadedBy;
    String uploadedById;
}
