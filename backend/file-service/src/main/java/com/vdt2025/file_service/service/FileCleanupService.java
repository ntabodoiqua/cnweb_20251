package com.vdt2025.file_service.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.vdt2025.file_service.client.UserServiceClient;
import com.vdt2025.file_service.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service để dọn dẹp các file không còn được tham chiếu trên S3
 * Chạy định kỳ mỗi 24h để tối ưu storage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileCleanupService {

    private final AmazonS3 amazonS3;
    private final FileStorageProperties fileStorageProperties;
    private final UploadedFileRepository uploadedFileRepository;
    private final UserServiceClient userServiceClient;

    @Value("${file.cleanup.enabled:true}")
    private boolean cleanupEnabled;

    @Value("${file.cleanup.batch-size:100}")
    private int batchSize;

    /**
     * Scheduled task chạy mỗi 24h để dọn dẹp orphan files
     * Cron: 0 0 2 * * * = 2:00 AM mỗi ngày
     */
    @Scheduled(cron = "${file.cleanup.cron:0 0 2 * * *}")
    public void cleanupOrphanFiles() {
        if (!cleanupEnabled) {
            log.info("File cleanup is disabled. Skipping cleanup task.");
            return;
        }

        log.info("Starting orphan file cleanup task at {}", LocalDateTime.now());
        long startTime = System.currentTimeMillis();

        try {
            // 1. Lấy tất cả files trên S3
            List<String> s3FileNames = getAllS3FileNames();
            log.info("Found {} files on S3", s3FileNames.size());

            if (s3FileNames.isEmpty()) {
                log.info("No files found on S3. Cleanup task completed.");
                return;
            }

            // 2. Tìm các file orphan
            Set<String> orphanFiles = findOrphanFiles(s3FileNames);
            log.info("Found {} orphan files", orphanFiles.size());

            if (orphanFiles.isEmpty()) {
                log.info("No orphan files found. Cleanup task completed.");
                return;
            }

            // 3. Xóa các orphan files
            int deletedCount = deleteOrphanFiles(orphanFiles);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Orphan file cleanup completed. Deleted {} files in {} ms", 
                    deletedCount, duration);

        } catch (Exception e) {
            log.error("Error during orphan file cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Lấy tất cả file names từ S3 bucket
     */
    private List<String> getAllS3FileNames() {
        List<String> fileNames = new ArrayList<>();
        String bucketName = fileStorageProperties.getS3().getBucketName();

        try {
            ObjectListing objectListing = amazonS3.listObjects(bucketName);
            
            do {
                for (S3ObjectSummary objectSummary : objectListing.getObjectSummaries()) {
                    fileNames.add(objectSummary.getKey());
                }
                objectListing = amazonS3.listNextBatchOfObjects(objectListing);
            } while (objectListing.isTruncated());

        } catch (Exception e) {
            log.error("Error listing files from S3: {}", e.getMessage(), e);
        }

        return fileNames;
    }

    /**
     * Tìm các file không còn được tham chiếu bởi bất kỳ entity nào
     * 
     * @param s3FileNames Danh sách file names trên S3
     * @return Set các file name là orphan
     */
    private Set<String> findOrphanFiles(List<String> s3FileNames) {
        Set<String> orphanFiles = new HashSet<>();

        // Chia nhỏ danh sách file thành các batch để xử lý
        List<List<String>> batches = partitionList(s3FileNames, batchSize);

        for (int i = 0; i < batches.size(); i++) {
            List<String> batch = batches.get(i);
            log.debug("Processing batch {}/{} with {} files", i + 1, batches.size(), batch.size());

            try {
                // Kiểm tra trong User Service (avatars, seller documents, logos, banners)
                Set<String> filesInUserService = new HashSet<>();
                try {
                    filesInUserService = userServiceClient.checkFileReferences(batch).getResult();
                } catch (Exception e) {
                    log.warn("Failed to check file references in User Service: {}", e.getMessage());
                    // Nếu không thể kiểm tra, giả định rằng tất cả đều được tham chiếu để an toàn
                    filesInUserService.addAll(batch);
                }

                // TODO: Thêm kiểm tra cho Product Service
                // Set<String> filesInProductService = productServiceClient.checkFileReferences(batch).getResult();

                // Tìm các file không có trong bất kỳ entity nào (ngoại trừ uploaded_files)
                for (String fileName : batch) {
                    boolean isReferenced = filesInUserService.contains(fileName);
                                        // || filesInProductService.contains(fileName);
                    
                    if (!isReferenced) {
                        orphanFiles.add(fileName);
                    }
                }

            } catch (Exception e) {
                log.error("Error processing batch: {}", e.getMessage(), e);
                // Skip this batch để tránh xóa nhầm
            }
        }

        return orphanFiles;
    }

    /**
     * Xóa các orphan files khỏi S3 và đánh dấu trong database
     * 
     * @param orphanFiles Set các file cần xóa
     * @return Số lượng file đã xóa thành công
     */
    private int deleteOrphanFiles(Set<String> orphanFiles) {
        String bucketName = fileStorageProperties.getS3().getBucketName();
        int deletedCount = 0;

        for (String fileName : orphanFiles) {
            try {
                // 1. Xóa khỏi S3
                amazonS3.deleteObject(bucketName, fileName);
                log.debug("Deleted file from S3: {}", fileName);

                // 2. Đánh dấu is_deleted = true trong database (nếu tồn tại)
                uploadedFileRepository.findByFileName(fileName).ifPresent(file -> {
                    file.setIsDeleted(true);
                    file.setDeletedAt(LocalDateTime.now());
                    uploadedFileRepository.save(file);
                    log.debug("Marked file as deleted in database: {}", fileName);
                });

                deletedCount++;

            } catch (Exception e) {
                log.error("Failed to delete orphan file {}: {}", fileName, e.getMessage());
            }
        }

        return deletedCount;
    }

    /**
     * Chia danh sách thành các batch nhỏ hơn
     */
    private <T> List<List<T>> partitionList(List<T> list, int batchSize) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += batchSize) {
            partitions.add(list.subList(i, Math.min(i + batchSize, list.size())));
        }
        return partitions;
    }

    /**
     * API thủ công để trigger cleanup
     * @return Thông báo kết quả
     */
    public String triggerManualCleanup() {
        log.info("Manual cleanup triggered by admin");
        cleanupOrphanFiles();
        return "Cleanup task has been triggered. Check logs for details.";
    }

    /**
     * Lấy thống kê về orphan files
     * @return Map chứa thống kê
     */
    public Map<String, Object> getOrphanFilesStatistics() {
        try {
            List<String> s3FileNames = getAllS3FileNames();
            Set<String> orphanFiles = findOrphanFiles(s3FileNames);
            
            // Tính tổng kích thước của orphan files
            long totalOrphanSize = 0;
            String bucketName = fileStorageProperties.getS3().getBucketName();
            
            for (String fileName : orphanFiles) {
                try {
                    totalOrphanSize += amazonS3.getObjectMetadata(bucketName, fileName).getContentLength();
                } catch (Exception e) {
                    log.warn("Failed to get size of file {}: {}", fileName, e.getMessage());
                }
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalFilesOnS3", s3FileNames.size());
            stats.put("orphanFilesCount", orphanFiles.size());
            stats.put("orphanFilesSizeBytes", totalOrphanSize);
            stats.put("orphanFilesSizeMB", totalOrphanSize / (1024.0 * 1024.0));
            stats.put("orphanFileNames", orphanFiles);
            stats.put("checkedAt", LocalDateTime.now());

            return stats;

        } catch (Exception e) {
            log.error("Error getting orphan files statistics: {}", e.getMessage(), e);
            return Map.of("error", e.getMessage());
        }
    }
}
