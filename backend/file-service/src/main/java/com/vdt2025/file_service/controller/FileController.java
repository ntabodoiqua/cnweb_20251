package com.vdt2025.file_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.file_service.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * Endpoint để tải lên một tệp tin.
     *
     * @param file Dữ liệu file được gửi từ client.
     * @return ApiResponse chứa tên file duy nhất và URL S3 để truy cập.
     */
    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);

        // Lấy URL S3 của file thay vì local URL
        String fileUrl = fileStorageService.getFileUrl(fileName);

        log.info("File uploaded successfully. S3 URL: {}", fileUrl);

        return ApiResponse.<String>builder()
                .result(fileName)
                .message("File uploaded successfully. S3 URL: " + fileUrl)
                .build();
    }

    /**
     * Endpoint để tải xuống một tệp tin.
     * Đây là cách viết đúng, sử dụng ResponseEntity<Resource>.
     *
     * @param fileName Tên file cần tải, lấy từ URL path.
     * @return ResponseEntity chứa nội dung file và các header cần thiết.
     */
    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFile(fileName);

        // Cố gắng xác định Content-Type của file
        String contentType = "application/octet-stream"; // Giá trị mặc định
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (IOException ex) {
            log.warn("Could not determine file type for file: {}", fileName);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * Endpoint để xóa một tệp tin.
     * Yêu cầu quyền ADMIN.
     *
     * @param fileName Tên file cần xóa.
     * @return ApiResponse thông báo thành công.
     */
    @DeleteMapping("/{fileName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteFile(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName);
        return ApiResponse.<String>builder()
                .message("File '" + fileName + "' has been deleted successfully.")
                .build();
    }

    // Lấy URL S3 của file đã tải lên
    @GetMapping("/path/{fileName}")
    public ApiResponse<String> getFilePath(@PathVariable String fileName) {
        String s3Url = fileStorageService.getFileUrl(fileName);
        return ApiResponse.<String>builder()
                .result(s3Url)
                .message("File S3 URL retrieved successfully.")
                .build();
    }

    // Lấy Presigned URL của file (cho bucket private)
    @GetMapping("/presigned-url/{fileName}")
    public ApiResponse<String> getPresignedUrl(
            @PathVariable String fileName,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        String presignedUrl = fileStorageService.getPresignedFileUrl(fileName, expirationMinutes);
        return ApiResponse.<String>builder()
                .result(presignedUrl)
                .message("Presigned URL retrieved successfully. Expires in " + expirationMinutes + " minutes.")
                .build();
    }
}
