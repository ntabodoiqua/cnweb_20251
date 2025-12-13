package com.cnweb2025.user_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Feign Client để gọi FileService API
 * Sử dụng OpenFeign với Spring Cloud để gọi microservice khác
 */
@FeignClient(
    name = "file-service",
    configuration = FileServiceClientConfig.class
)
public interface FileServiceClient {
    
    /**
     * Upload file đến FileService
     * 
     * @param file File cần upload
     * @return Response chứa thông tin file đã upload
     */
    @PostMapping(value = "/api/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<FileServiceResponse> uploadFile(@RequestPart("file") MultipartFile file);
    
    /**
     * Xóa file từ FileService (compensating transaction)
     * 
     * @param fileName Tên file cần xóa
     * @return Response xác nhận xóa
     */
    @DeleteMapping("/api/files/{fileName}")
    ResponseEntity<Void> deleteFile(@PathVariable("fileName") String fileName);
    
    /**
     * DTO cho response từ FileService
     */
    record FileServiceResponse(
        String fileName,
        String fileUrl,
        Long fileSize,
        String contentType,
        String message
    ) {}
}
