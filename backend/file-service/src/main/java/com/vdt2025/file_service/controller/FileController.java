package com.vdt2025.file_service.controller;

import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.file_service.dto.FileInfoResponse;
import com.vdt2025.file_service.dto.S3FileInfo;
import com.vdt2025.file_service.entity.UploadedFile;
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
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * API 1: Upload file với quyền PUBLIC (mọi người đều xem được)
     *
     * @param file Dữ liệu file được gửi từ client.
     * @return ApiResponse chứa thông tin file và public URL.
     */
    @PostMapping("/upload/public")
    public ApiResponse<FileInfoResponse> uploadPublicFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file, true); // true = public

        // Tạo public URL
        String fileUrl = fileStorageService.getFileUrl(fileName);

        log.info("Public file uploaded successfully: {}", fileName);

        FileInfoResponse response = FileInfoResponse.builder()
                .fileName(fileName)
                .originalFileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .fileUrl(fileUrl)
                .isPublic(true)
                .build();

        return ApiResponse.<FileInfoResponse>builder()
                .result(response)
                .message("Public file uploaded successfully. URL: " + fileUrl)
                .build();
    }

    /**
     * API 2: Upload file với quyền PRIVATE (cần quyền để xem)
     *
     * @param file Dữ liệu file được gửi từ client.
     * @return ApiResponse chứa thông tin file và presigned URL.
     */
    @PostMapping("/upload/private")
    public ApiResponse<FileInfoResponse> uploadPrivateFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file, false); // false = private

        // Tạo presigned URL (có thời gian hết hạn 7 ngày)
        String fileUrl = fileStorageService.getPresignedFileUrl(fileName, 10080);

        log.info("Private file uploaded successfully: {}", fileName);

        FileInfoResponse response = FileInfoResponse.builder()
                .fileName(fileName)
                .originalFileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .fileUrl(fileUrl)
                .isPublic(false)
                .build();

        return ApiResponse.<FileInfoResponse>builder()
                .result(response)
                .message("Private file uploaded successfully. Presigned URL (expires in 7 days): " + fileUrl)
                .build();
    }

    /**
     * API 3: Liệt kê tất cả các file trong S3 bucket
     *
     * @param prefix Optional prefix để filter files (ví dụ: "images/")
     * @return ApiResponse chứa danh sách các file.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/list")
    public ApiResponse<List<S3FileInfo>> listFiles(
            @RequestParam(required = false) String prefix) {
        
        List<S3ObjectSummary> s3Files;
        
        if (prefix != null && !prefix.isEmpty()) {
            s3Files = fileStorageService.listFiles(prefix);
        } else {
            s3Files = fileStorageService.listFiles();
        }

        // Convert S3ObjectSummary to S3FileInfo DTO
        List<S3FileInfo> fileInfos = s3Files.stream()
                .map(s3Object -> {
                    String url = fileStorageService.getFileUrl(s3Object.getKey());
                    return S3FileInfo.builder()
                            .key(s3Object.getKey())
                            .size(s3Object.getSize())
                            .lastModified(s3Object.getLastModified())
                            .url(url)
                            .etag(s3Object.getETag())
                            .build();
                })
                .collect(Collectors.toList());

        log.info("Listed {} files from S3", fileInfos.size());

        return ApiResponse.<List<S3FileInfo>>builder()
                .result(fileInfos)
                .message("Files listed successfully. Total: " + fileInfos.size())
                .build();
    }

    /**
     * Endpoint để tải lên một tệp tin (backward compatibility - mặc định private).
     *
     * @param file Dữ liệu file được gửi từ client.
     * @return ApiResponse chứa tên file duy nhất và URL để truy cập.
     */
    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file, false); // Mặc định private

        // Lấy URL S3 của file
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

    /**
     * API 4: Xem file PRIVATE với quyền hợp lệ
     * Kiểm tra quyền truy cập:
     * - Admin: xem được tất cả files
     * - User thường: chỉ xem được file public hoặc file mình upload
     *
     * @param fileName Tên file cần xem.
     * @param expirationMinutes Thời gian hết hạn của presigned URL (mặc định 60 phút).
     * @return ApiResponse chứa URL để truy cập file.
     */
    @GetMapping("/view/{fileName}")
    public ApiResponse<String> viewPrivateFile(
            @PathVariable String fileName,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        
        // Method này sẽ kiểm tra quyền tự động
        String fileUrl = fileStorageService.getPrivateFileUrl(fileName, expirationMinutes);

        log.info("File access granted: {}", fileName);

        return ApiResponse.<String>builder()
                .result(fileUrl)
                .message("File access granted. URL: " + fileUrl)
                .build();
    }

    /**
     * API 5: Lấy danh sách file của user hiện tại
     * - Admin: xem tất cả files
     * - User: chỉ xem file public và file mình upload
     *
     * @return ApiResponse chứa danh sách files.
     */
    @GetMapping("/my-files")
    public ApiResponse<List<FileInfoResponse>> getMyFiles() {
        List<UploadedFile> files = fileStorageService.getMyFiles();

        // Convert Entity to DTO
        List<FileInfoResponse> fileInfos = files.stream()
                .map(file -> {
                    String url = file.getIsPublic() 
                            ? fileStorageService.getFileUrl(file.getFileName())
                            : fileStorageService.getPresignedFileUrl(file.getFileName(), 10080); // 7 days
                    
                    return FileInfoResponse.builder()
                            .fileName(file.getFileName())
                            .originalFileName(file.getOriginalFileName())
                            .fileType(file.getFileType())
                            .fileSize(file.getFileSize())
                            .fileUrl(url)
                            .isPublic(file.getIsPublic())
                            .uploadedAt(file.getUploadedAt())
                            .uploadedBy(file.getUploadedBy())
                            .uploadedById(file.getUploadedById())
                            .build();
                })
                .collect(Collectors.toList());

        log.info("Retrieved {} files for current user", fileInfos.size());

        return ApiResponse.<List<FileInfoResponse>>builder()
                .result(fileInfos)
                .message("Files retrieved successfully. Total: " + fileInfos.size())
                .build();
    }
}
