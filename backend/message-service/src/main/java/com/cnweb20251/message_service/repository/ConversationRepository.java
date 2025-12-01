package com.cnweb20251.message_service.repository;

import com.cnweb20251.message_service.entity.Conversation;
import com.cnweb20251.message_service.enums.ConversationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository để thao tác với collection conversations trong MongoDB.
 * Chỉ hỗ trợ chat giữa buyer và shop (seller).
 */
@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    /**
     * Tìm conversation theo shopId và buyerId.
     * Dùng để kiểm tra conversation đã tồn tại chưa trước khi tạo mới.
     * Đây là phương thức chính để tìm conversation buyer-seller.
     */
    Optional<Conversation> findByShopIdAndBuyerId(String shopId, String buyerId);

    /**
     * Tìm tất cả conversations của một buyer, sắp xếp theo thời gian cập nhật mới nhất.
     */
    Page<Conversation> findByBuyerId(String buyerId, Pageable pageable);

    /**
     * Tìm tất cả conversations của một shop, sắp xếp theo thời gian cập nhật mới nhất.
     */
    Page<Conversation> findByShopId(String shopId, Pageable pageable);

    /**
     * Tìm conversation theo participantIds (backward compatibility).
     * Dùng để kiểm tra conversation đã tồn tại chưa trước khi tạo mới.
     */
    @Query("{ 'participantIds': { $all: ?0, $size: 2 } }")
    Optional<Conversation> findByParticipantIds(Set<String> participantIds);

    /**
     * Tìm tất cả conversations của một user, sắp xếp theo thời gian cập nhật mới nhất.
     * User có thể là buyer hoặc shop owner.
     */
    @Query("{ 'participantIds': ?0 }")
    Page<Conversation> findByParticipantId(String userId, Pageable pageable);

    /**
     * Tìm tất cả conversations của một user với trạng thái cụ thể.
     */
    @Query("{ 'participantIds': ?0, 'status': ?1 }")
    Page<Conversation> findByParticipantIdAndStatus(String userId, ConversationStatus status, Pageable pageable);

    /**
     * Tìm tất cả conversations của một user (không phân trang).
     */
    @Query("{ 'participantIds': ?0 }")
    List<Conversation> findAllByParticipantId(String userId);

    /**
     * Tìm tất cả conversations của một buyer (không phân trang).
     */
    List<Conversation> findAllByBuyerId(String buyerId);

    /**
     * Tìm tất cả conversations của một shop (không phân trang).
     */
    List<Conversation> findAllByShopId(String shopId);

    /**
     * Đếm số conversations chưa đọc của một user.
     */
    @Query(value = "{ 'participantIds': ?0, 'unreadCount.?0': { $gt: 0 } }", count = true)
    long countUnreadConversations(String userId);

    /**
     * Tìm conversations có tin nhắn mới trong khoảng thời gian.
     */
    @Query("{ 'participantIds': ?0, 'updatedAt': { $gte: ?1 } }")
    List<Conversation> findRecentConversations(String userId, java.time.Instant since);
}
