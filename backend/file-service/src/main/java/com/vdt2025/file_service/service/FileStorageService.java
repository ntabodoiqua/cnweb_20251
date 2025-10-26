package com.vdt2025.file_service.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.HttpMethod;
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
import java.util.Optional;
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
     * @param isPublic True nếu file public, False nếu private.
     * @return Tên file duy nhất đã được lưu.
     */
    @Transactional
    public String storeFile(MultipartFile file, boolean isPublic) {
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

        // Lấy thông tin người dùng hiện tại từ SecurityContext
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Gọi user-service để lấy thông tin đầy đủ của user
        com.vdt2025.common_dto.dto.response.UserResponse user;
        try {
            user = userServiceClient.getUserByUsername(currentUsername).getResult();
        } catch (Exception ex) {
            log.error("Failed to get user information for username: {}", currentUsername, ex);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        // Kiểm tra xem user có bị disable không
        if (!user.isEnabled()) {
            log.warn("User {} is disabled, cannot upload file", currentUsername);
            throw new AppException(ErrorCode.USER_DISABLED);
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

            // Đặt ACL dựa trên isPublic
            if (isPublic) {
                putObjectRequest.setCannedAcl(CannedAccessControlList.PublicRead);
                log.info("Setting file {} as PUBLIC", fileName);
            } else {
                putObjectRequest.setCannedAcl(CannedAccessControlList.Private);
                log.info("Setting file {} as PRIVATE", fileName);
            }

            amazonS3.putObject(putObjectRequest);
            log.info("File uploaded to S3: {}/{}", bucketName, fileName);

            // Tạo và lưu thông tin file vào cơ sở dữ liệu với userId và isPublic flag
            UploadedFile uploadedFile = UploadedFile.builder()
                    .fileName(fileName)
                    .originalFileName(originalFilename)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .uploadedBy(currentUsername)
                    .uploadedById(user.getId()) // Lưu userId
                    .isPublic(isPublic) // Lưu trạng thái public/private
                    .build();
            uploadedFileRepository.save(uploadedFile);

            log.info("File stored successfully: {} by user: {} (ID: {}), isPublic: {}", 
                    fileName, currentUsername, user.getId(), isPublic);
            return fileName;
        } catch (IOException ex) {
            log.error("Could not store file {}. Please try again!", fileName, ex);
            throw new AppException(ErrorCode.FILE_CANNOT_STORED);
        }
    }

    /**
     * Tạo URL công khai để truy cập file trên S3.
     * CHÚ Ý: URL này chỉ hoạt động nếu bucket được cấu hình PUBLIC ACCESS.
     * Nếu bucket là PRIVATE, sử dụng getPresignedFileUrl() thay thế.
     * 
     * @param fileName Tên file.
     * @return URL công khai của file trên S3.
     */
    public String getFileUrl(String fileName) {
        String bucketName = fileStorageProperties.getS3().getBucketName();
        String endpoint = fileStorageProperties.getS3().getEndpoint();
        
        // Format cho DigitalOcean Spaces (Virtual-hosted style):
        // https://{bucket-name}.{region}.digitaloceanspaces.com/{filename}
        // Ví dụ: https://hla.sgp1.digitaloceanspaces.com/filename.jpg
        
        // Trích xuất domain từ endpoint (remove https:// và region prefix nếu có)
        String domain = endpoint.replace("https://", "").replace("http://", "");
        
        // Tạo URL theo format: https://{bucket}.{domain}/{filename}
        return String.format("https://%s.%s/%s", bucketName, domain, fileName);
    }

    /**
     * Tạo Presigned URL để truy cập file private trên S3.
     * URL này có thời gian hết hạn, phù hợp cho bucket PRIVATE.
     * 
     * @param fileName Tên file.
     * @param expirationMinutes Thời gian hết hạn (phút). Mặc định 60 phút.
     * @return Presigned URL có thời gian hết hạn.
     */
    public String getPresignedFileUrl(String fileName, int expirationMinutes) {
        String bucketName = fileStorageProperties.getS3().getBucketName();
        
        // Tạo thời gian hết hạn
        java.util.Date expiration = new java.util.Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000L * 60 * expirationMinutes; // Thêm số phút
        expiration.setTime(expTimeMillis);
        
        // Tạo presigned URL
        java.net.URL url = amazonS3.generatePresignedUrl(bucketName, fileName, expiration, HttpMethod.GET);
        return url.toString();
    }

    /**
     * Tạo Presigned URL với thời gian hết hạn mặc định 60 phút.
     * 
     * @param fileName Tên file.
     * @return Presigned URL có thời gian hết hạn 60 phút.
     */
    public String getPresignedFileUrl(String fileName) {
        return getPresignedFileUrl(fileName, 60); // Mặc định 60 phút
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

    /**
     * Liệt kê tất cả các file trong S3 bucket.
     * 
     * @return Danh sách các file summary từ S3.
     */
    public java.util.List<S3ObjectSummary> listFiles() {
        try {
            String bucketName = fileStorageProperties.getS3().getBucketName();
            
            ObjectListing objectListing = amazonS3.listObjects(bucketName);
            java.util.List<S3ObjectSummary> files = objectListing.getObjectSummaries();
            
            log.info("Listed {} files from S3 bucket: {}", files.size(), bucketName);
            return files;
        } catch (Exception ex) {
            log.error("Error listing files from S3", ex);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    /**
     * Liệt kê các file với prefix (folder).
     * 
     * @param prefix Prefix/folder để filter files.
     * @return Danh sách các file summary từ S3.
     */
    public java.util.List<S3ObjectSummary> listFiles(String prefix) {
        try {
            String bucketName = fileStorageProperties.getS3().getBucketName();
            
            ListObjectsRequest listObjectsRequest = new ListObjectsRequest()
                    .withBucketName(bucketName)
                    .withPrefix(prefix);
            
            ObjectListing objectListing = amazonS3.listObjects(listObjectsRequest);
            java.util.List<S3ObjectSummary> files = objectListing.getObjectSummaries();
            
            log.info("Listed {} files with prefix '{}' from S3 bucket: {}", 
                    files.size(), prefix, bucketName);
            return files;
        } catch (Exception ex) {
            log.error("Error listing files with prefix '{}' from S3", prefix, ex);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    /**
     * Kiểm tra xem user có quyền truy cập file không.
     * - Admin: có quyền truy cập tất cả files
     * - User thường: chỉ truy cập được file public hoặc file mình upload
     * 
     * @param fileName Tên file cần kiểm tra.
     * @param currentUserId User ID của người đang request.
     * @param isAdmin True nếu user là admin.
     * @return True nếu có quyền, False nếu không.
     */
    public boolean hasAccessToFile(String fileName, String currentUserId, boolean isAdmin) {
        // Admin có quyền truy cập tất cả
        if (isAdmin) {
            return true;
        }

        // Tìm file trong database
        Optional<UploadedFile> fileOpt = uploadedFileRepository.findByFileName(fileName);
        
        if (fileOpt.isEmpty()) {
            return false;
        }

        UploadedFile file = fileOpt.get();

        // File public: mọi người đều xem được
        if (file.getIsPublic()) {
            return true;
        }

        // File private: chỉ owner mới xem được
        return file.getUploadedById().equals(currentUserId);
    }

    /**
     * Lấy presigned URL cho file private (với kiểm tra quyền).
     * 
     * @param fileName Tên file.
     * @param expirationMinutes Thời gian hết hạn (phút).
     * @return Presigned URL.
     */
    public String getPrivateFileUrl(String fileName, int expirationMinutes) {
        // Lấy thông tin user hiện tại
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Kiểm tra xem user có role ADMIN không
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        // Lấy userId từ user-service
        com.vdt2025.common_dto.dto.response.UserResponse user;
        try {
            user = userServiceClient.getUserByUsername(currentUsername).getResult();
        } catch (Exception ex) {
            log.error("Failed to get user information for username: {}", currentUsername, ex);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        // Kiểm tra quyền truy cập
        if (!hasAccessToFile(fileName, user.getId(), isAdmin)) {
            log.warn("User {} (ID: {}) attempted to access unauthorized file: {}", 
                    currentUsername, user.getId(), fileName);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Tìm file trong database
        UploadedFile fileEntity = uploadedFileRepository.findByFileName(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        // Nếu là file public, trả về public URL
        if (fileEntity.getIsPublic()) {
            return getFileUrl(fileName);
        }

        // Nếu là file private, tạo presigned URL
        return getPresignedFileUrl(fileName, expirationMinutes);
    }

    /**
     * Lấy danh sách file của user hiện tại.
     * - Admin: xem tất cả files
     * - User: chỉ xem file public và file mình upload
     * 
     * @return Danh sách files.
     */
    public java.util.List<UploadedFile> getMyFiles() {
        // Lấy thông tin user hiện tại
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Kiểm tra xem user có role ADMIN không
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        // Admin xem tất cả files
        if (isAdmin) {
            return uploadedFileRepository.findAll();
        }

        // User thường: lấy userId
        com.vdt2025.common_dto.dto.response.UserResponse user;
        try {
            user = userServiceClient.getUserByUsername(currentUsername).getResult();
        } catch (Exception ex) {
            log.error("Failed to get user information for username: {}", currentUsername, ex);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        // Lấy file public hoặc file của user
        return uploadedFileRepository.findByUploadedByIdOrIsPublic(user.getId(), true);
    }
}
