package com.cnweb2025.user_service.dto.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO cho request upload file từ client
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadRequest {
    
    private String userId;
    private MultipartFile file;
    private String description;
}
