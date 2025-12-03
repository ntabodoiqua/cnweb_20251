package com.cnweb20251.message_service.repository;

import com.cnweb20251.message_service.entity.Message;
import com.cnweb20251.message_service.enums.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository để thao tác với collection messages trong MongoDB.
 */
@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Tìm tất cả messages trong một conversation, sắp xếp theo thời gian gửi (mới nhất trước).
     */
    Page<Message> findByConversationIdAndDeletedFalseOrderBySentAtDesc(String conversationId, Pageable pageable);

    /**
     * Tìm tất cả messages trong một conversation, sắp xếp theo thời gian gửi (cũ nhất trước).
     */
    Page<Message> findByConversationIdAndDeletedFalseOrderBySentAtAsc(String conversationId, Pageable pageable);

    /**
     * Tìm messages trước một thời điểm (để implement infinite scroll).
     */
    @Query("{ 'conversationId': ?0, 'sentAt': { $lt: ?1 }, 'deleted': false }")
    Page<Message> findMessagesBeforeTimestamp(String conversationId, Instant before, Pageable pageable);

    /**
     * Tìm messages sau một thời điểm (để load tin nhắn mới).
     */
    @Query("{ 'conversationId': ?0, 'sentAt': { $gt: ?1 }, 'deleted': false }")
    List<Message> findMessagesAfterTimestamp(String conversationId, Instant after);

    /**
     * Đếm số messages chưa đọc trong conversation cho một user.
     */
    @Query(value = "{ 'conversationId': ?0, 'senderId': { $ne: ?1 }, 'readBy': { $nin: [?1] }, 'deleted': false }", count = true)
    long countUnreadMessages(String conversationId, String userId);

    /**
     * Tìm messages chưa đọc trong conversation cho một user.
     */
    @Query("{ 'conversationId': ?0, 'senderId': { $ne: ?1 }, 'readBy': { $nin: [?1] }, 'deleted': false }")
    List<Message> findUnreadMessages(String conversationId, String userId);

    /**
     * Tìm message cuối cùng trong conversation.
     */
    Message findFirstByConversationIdAndDeletedFalseOrderBySentAtDesc(String conversationId);

    /**
     * Tìm tất cả messages cũ hơn một thời điểm (để cleanup).
     */
    @Query("{ 'sentAt': { $lt: ?0 } }")
    List<Message> findMessagesBefore(Instant before);

    /**
     * Xóa tất cả messages cũ hơn một thời điểm.
     */
    void deleteAllBySentAtBefore(Instant before);

    /**
     * Tìm messages theo sender trong conversation.
     */
    List<Message> findByConversationIdAndSenderIdAndDeletedFalse(String conversationId, String senderId);

    /**
     * Tìm messages theo trạng thái.
     */
    List<Message> findByConversationIdAndStatusAndDeletedFalse(String conversationId, MessageStatus status);

    /**
     * Đếm tổng số messages trong một conversation.
     */
    long countByConversationIdAndDeletedFalse(String conversationId);
}
