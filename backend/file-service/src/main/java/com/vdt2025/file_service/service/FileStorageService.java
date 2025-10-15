package com.vdt2025.file_service.service;

import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.file_service.entity.UploadedFile;
import com.vdt2025.file_service.exception.AppException;
import com.vdt2025.file_service.exception.ErrorCode;
import com.vdt2025.file_service.repository.UploadedFileRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileStorageService {

    final UploadedFileRepository uploadedFileRepository;
    final FileStorageProperties fileStorageProperties;
    final UserServiceClient userServiceClient;

    // Đường dẫn gốc để lưu trữ file, được khởi tạo một lần duy nhất.
    Path fileStorageLocation;

    /**
     * Phương thức này được gọi ngay sau khi service được khởi tạo.
     * Nó khởi tạo đường dẫn lưu trữ và tạo thư mục nếu chưa tồn tại.
     */
    @PostConstruct
    public void init() {
        try {
            this.fileStorageLocation = Paths.get(fileStorageProperties.getDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage directory initialized at: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            log.error("Could not create the directory where the uploaded files will be stored.", ex);
            throw new AppException(ErrorCode.FILE_STORAGE_INIT_ERROR);
        }
    }

    /**
     * Lưu trữ file tải lên và ghi thông tin vào cơ sở dữ liệu.
     *
     * @param file File được tải lên từ client.
     * @return Tên file duy nhất đã được lưu.
     */
    @Transactional
    public String storeFile(MultipartFile file) {
        // Kiểm tra file rỗng
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        }

        // Lấy tên file gốc và làm sạch nó
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        // [BẢO MẬT] Kiểm tra xem tên file có chứa ký tự không hợp lệ không
        if (originalFilename.contains("..")) {
            throw new AppException(ErrorCode.INVALID_FILE_PATH);
        }

        // Tạo tên file duy nhất để tránh trùng lặp
        String fileName = UUID.randomUUID() + "_" + originalFilename;

        try {
            // Xây dựng đường dẫn đầy đủ để lưu file
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            // Sao chép nội dung file vào vị trí đích
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Lấy thông tin người dùng hiện tại
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            String userId = userServiceClient.getUserByUsername(currentUsername).getResult().getId();

            // Tạo và lưu thông tin file vào cơ sở dữ liệu
            UploadedFile uploadedFile = UploadedFile.builder()
                    .fileName(fileName)
                    .originalFileName(originalFilename)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .uploadedBy(userId)
                    .build();
            uploadedFileRepository.save(uploadedFile);

            log.info("File stored successfully: {}", fileName);
            return fileName;
        } catch (IOException ex) {
            log.error("Could not store file {}. Please try again!", fileName, ex);
            throw new AppException(ErrorCode.FILE_CANNOT_STORED);
        }
    }

    /**
     * Tải file dưới dạng Resource.
     *
     * @param fileName Tên file cần tải.
     * @return Resource của file.
     */
    public Resource loadFile(String fileName) {
        try {
            // [BẢO MẬT] Ngăn chặn Path Traversal
            if (fileName.contains("..")) {
                throw new AppException(ErrorCode.INVALID_FILE_PATH);
            }

            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            // [BẢO MẬT] Đảm bảo đường dẫn cuối cùng không đi ra ngoài thư mục gốc
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new AppException(ErrorCode.INVALID_FILE_PATH);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }
        } catch (MalformedURLException ex) {
            log.error("Malformed URL for file: {}", fileName, ex);
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    /**
     * Xóa một file khỏi hệ thống và cơ sở dữ liệu.
     * Yêu cầu quyền ADMIN.
     *
     * @param fileName Tên file cần xóa.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteFile(String fileName) {
        // 1. Tìm thông tin file trong cơ sở dữ liệu
        UploadedFile fileEntity = uploadedFileRepository.findByFileName(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        try {
            // 2. Xây dựng đường dẫn đến file vật lý
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            // 3. Xóa file vật lý khỏi hệ thống
            Files.deleteIfExists(filePath);

            // 4. Xóa bản ghi khỏi cơ sở dữ liệu
            uploadedFileRepository.delete(fileEntity);

            log.info("File deleted successfully: {}", fileName);
        } catch (IOException ex) {
            log.error("Error occurred while deleting file: {}", fileName, ex);
            // Ném exception để kích hoạt rollback của @Transactional
            throw new AppException(ErrorCode.FILE_CANNOT_DELETED);
        }
    }
}
