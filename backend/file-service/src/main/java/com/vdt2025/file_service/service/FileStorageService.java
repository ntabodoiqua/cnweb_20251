package com.vdt2025.file_service.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
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
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
    final AmazonS3 amazonS3;

    /**
     * Phương thức này được gọi ngay sau khi service được khởi tạo.
     */
    @PostConstruct
    public void init() {
        log.info("Using S3 storage with bucket: {}", fileStorageProperties.getS3().getBucketName());
    }

    /**
     * Lưu trữ file tải lên vào S3 và ghi thông tin vào cơ sở dữ liệu.
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
            // Upload to S3
            String bucketName = fileStorageProperties.getS3().getBucketName();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    bucketName,
                    fileName,
                    file.getInputStream(),
                    metadata
            );

            amazonS3.putObject(putObjectRequest);
            log.info("File uploaded to S3: {}/{}", bucketName, fileName);

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
     * Tải file từ S3 dưới dạng Resource.
     *
     * @param fileName Tên file cần tải.
     * @return Resource của file.
     */
    public Resource loadFile(String fileName) {
        // [BẢO MẬT] Ngăn chặn Path Traversal
        if (fileName.contains("..")) {
            throw new AppException(ErrorCode.INVALID_FILE_PATH);
        }

        try {
            String bucketName = fileStorageProperties.getS3().getBucketName();
            S3Object s3Object = amazonS3.getObject(bucketName, fileName);
            S3ObjectInputStream inputStream = s3Object.getObjectContent();

            // Read the content into a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            inputStream.close();

            byte[] data = outputStream.toByteArray();
            return new ByteArrayResource(data);
        } catch (Exception ex) {
            log.error("Error loading file from S3: {}", fileName, ex);
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    /**
     * Xóa một file khỏi S3 và cơ sở dữ liệu.
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
            // 2. Xóa file từ S3
            String bucketName = fileStorageProperties.getS3().getBucketName();
            amazonS3.deleteObject(bucketName, fileName);
            log.info("File deleted from S3: {}/{}", bucketName, fileName);

            // 3. Xóa bản ghi khỏi cơ sở dữ liệu
            uploadedFileRepository.delete(fileEntity);

            log.info("File deleted successfully: {}", fileName);
        } catch (Exception ex) {
            log.error("Error occurred while deleting file: {}", fileName, ex);
            // Ném exception để kích hoạt rollback của @Transactional
            throw new AppException(ErrorCode.FILE_CANNOT_DELETED);
        }
    }
}
