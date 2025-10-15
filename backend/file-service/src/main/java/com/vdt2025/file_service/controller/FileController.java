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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
     * @return ApiResponse chứa tên file duy nhất và đường dẫn để tải về.
     */
    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);

        // Tạo đường dẫn đầy đủ để client có thể truy cập file sau này
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        log.info("File uploaded successfully. Download URI: {}", fileDownloadUri);

        return ApiResponse.<String>builder()
                .result(fileName)
                .message("File uploaded successfully. Download URI: " + fileDownloadUri)
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

    // Lấy đường dẫn của file đã tải lên
    // Thêm địa chỉ host + port + "/uploads/" vào tên file để tạo đường dẫn đầy đủ
    @GetMapping("/path/{fileName}")
    public ApiResponse<String> getFilePath(@PathVariable String fileName) {
        String filePath = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();
        return ApiResponse.<String>builder()
                .result(filePath)
                .message("File path retrieved successfully.")
                .build();
    }
}
