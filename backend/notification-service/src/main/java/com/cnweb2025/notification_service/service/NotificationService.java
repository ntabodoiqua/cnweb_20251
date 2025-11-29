package com.cnweb2025.notification_service.service;

import com.cnweb2025.notification_service.dto.CreateNotificationRequest;
import com.cnweb2025.notification_service.dto.NotificationDTO;
import com.cnweb2025.notification_service.entity.Notification;
import com.cnweb2025.notification_service.entity.NotificationType;
import com.cnweb2025.notification_service.mapper.NotificationMapper;
import com.cnweb2025.notification_service.repository.NotificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {
    
    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;
    WebSocketService webSocketService;
    
    /**
     * Tạo và gửi thông báo push
     */
    @Transactional
    public NotificationDTO createAndSendNotification(CreateNotificationRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());
        
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .link(request.getLink())
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        NotificationDTO dto = notificationMapper.toDTO(notification);
        
        // Gửi push notification qua WebSocket
        webSocketService.sendNotificationToUser(request.getUserId(), dto);
        
        log.info("Notification created and sent to user: {}", request.getUserId());
        return dto;
    }
    
    /**
     * Tạo và gửi thông báo (convenience method)
     */
    @Transactional
    public NotificationDTO createAndSendNotification(
            String userId,
            String title,
            String message,
            NotificationType type,
            String link,
            String imageUrl
    ) {
        return createAndSendNotification(CreateNotificationRequest.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .imageUrl(imageUrl)
                .build());
    }
    
    /**
     * Tạo và gửi thông báo với đảm bảo idempotency
     * Kiểm tra xem notification với referenceId và referenceType đã tồn tại chưa
     * Nếu đã tồn tại thì bỏ qua, không tạo mới
     */
    @Transactional
    public NotificationDTO createAndSendNotificationIdempotent(
            String userId,
            String title,
            String message,
            NotificationType type,
            String link,
            String imageUrl,
            String referenceId,
            String referenceType
    ) {
        // Kiểm tra idempotency - notification đã tồn tại chưa
        if (referenceId != null && referenceType != null) {
            boolean exists = notificationRepository.existsByUserIdAndReferenceIdAndReferenceType(
                    userId, referenceId, referenceType);
            if (exists) {
                log.info("Notification already exists for user: {}, referenceId: {}, referenceType: {}. Skipping...",
                        userId, referenceId, referenceType);
                return null;
            }
        }
        
        log.info("Creating idempotent notification for user: {}, referenceId: {}, referenceType: {}",
                userId, referenceId, referenceType);
        
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .imageUrl(imageUrl)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        NotificationDTO dto = notificationMapper.toDTO(notification);
        
        // Gửi push notification qua WebSocket
        webSocketService.sendNotificationToUser(userId, dto);
        
        log.info("Idempotent notification created and sent to user: {}", userId);
        return dto;
    }
    
    /**
     * Lấy danh sách thông báo của user (có phân trang)
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDTO);
    }
    
    /**
     * Lấy 10 thông báo gần nhất
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecentNotifications(String userId) {
        Pageable pageable = PageRequest.of(0, 10);
        List<Notification> notifications = notificationRepository
                .findTop10ByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notificationMapper.toDTOList(notifications);
    }
    
    /**
     * Lấy danh sách thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        return notificationMapper.toDTOList(
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
        );
    }
    
    /**
     * Đếm số thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Đánh dấu một thông báo đã đọc
     */
    @Transactional
    public boolean markAsRead(String notificationId, String userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        if (updated > 0) {
            // Gửi cập nhật số lượng chưa đọc
            long unreadCount = getUnreadCount(userId);
            webSocketService.sendUnreadCountToUser(userId, unreadCount);
        }
        return updated > 0;
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @Transactional
    public int markAllAsRead(String userId) {
        int updated = notificationRepository.markAllAsRead(userId, LocalDateTime.now());
        if (updated > 0) {
            // Gửi cập nhật số lượng chưa đọc (sẽ là 0)
            webSocketService.sendUnreadCountToUser(userId, 0);
        }
        return updated;
    }
    
    /**
     * Xóa thông báo cũ (scheduled job)
     */
    @Transactional
    public int deleteOldNotifications(int daysOld) {
        LocalDateTime before = LocalDateTime.now().minusDays(daysOld);
        int deleted = notificationRepository.deleteOldNotifications(before);
        log.info("Deleted {} old notifications older than {} days", deleted, daysOld);
        return deleted;
    }
}
