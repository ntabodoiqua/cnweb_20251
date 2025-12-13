package com.cnweb2025.user_service.dto.response;

import com.cnweb2025.user_service.entity.UserFileMetadata;
import lombok.*;

/**
 * DTO cho response upload file
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {
    
    private Long id;
    private String userId;
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String fileType;
    private String fileUrl;
    private UserFileMetadata.UploadStatus status;
    private String message;
}
