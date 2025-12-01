package com.cnweb20251.message_service.service;

import com.cnweb20251.message_service.client.OrderServiceClient;
import com.cnweb20251.message_service.client.ProductServiceClient;
import com.cnweb20251.message_service.client.UserServiceClient;
import com.cnweb20251.message_service.dto.request.CreateConversationRequest;
import com.cnweb20251.message_service.dto.request.SendMessageRequest;
import com.cnweb20251.message_service.dto.response.*;
import com.cnweb20251.message_service.entity.*;
import com.cnweb20251.message_service.enums.*;
import com.cnweb20251.message_service.exception.ChatException;
import com.cnweb20251.message_service.mapper.ChatMapper;
import com.cnweb20251.message_service.repository.ConversationRepository;
import com.cnweb20251.message_service.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý logic chat chính.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserServiceClient userServiceClient;
    private final ProductServiceClient productServiceClient;
    private final OrderServiceClient orderServiceClient;

    // ========================= CONVERSATION METHODS =========================

    /**
     * Tạo hoặc lấy conversation giữa 2 người dùng.
     */
    @Transactional
    public ConversationResponse getOrCreateConversation(String currentUserId, CreateConversationRequest request) {
        Set<String> participantIds = new HashSet<>(Arrays.asList(currentUserId, request.getRecipientId()));
        
        // Kiểm tra conversation đã tồn tại chưa
        Optional<Conversation> existingConversation = conversationRepository.findByParticipantIds(participantIds);
        
        if (existingConversation.isPresent()) {
            return chatMapper.toConversationResponse(existingConversation.get());
        }
        
        // Tạo conversation mới
        Conversation conversation = createNewConversation(currentUserId, request);
        Conversation savedConversation = conversationRepository.save(conversation);
        
        log.info("Created new conversation: {} between {} and {}", 
                savedConversation.getId(), currentUserId, request.getRecipientId());
        
        return chatMapper.toConversationResponse(savedConversation);
    }

    /**
     * Lấy danh sách conversations của user.
     */
    public PageResponse<ConversationResponse> getUserConversations(String userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Conversation> conversationPage = conversationRepository.findByParticipantId(userId, pageRequest);
        
        List<ConversationResponse> responses = conversationPage.getContent().stream()
                .map(chatMapper::toConversationResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<ConversationResponse>builder()
                .content(responses)
                .page(page)
                .size(size)
                .totalElements(conversationPage.getTotalElements())
                .totalPages(conversationPage.getTotalPages())
                .first(conversationPage.isFirst())
                .last(conversationPage.isLast())
                .hasNext(conversationPage.hasNext())
                .hasPrevious(conversationPage.hasPrevious())
                .build();
    }

    /**
     * Lấy chi tiết một conversation.
     */
    public ConversationResponse getConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ChatException("Conversation not found"));
        
        // Kiểm tra user có trong conversation không
        if (!conversation.getParticipantIds().contains(userId)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        return chatMapper.toConversationResponse(conversation);
    }

    // ========================= MESSAGE METHODS =========================

    /**
     * Gửi tin nhắn mới.
     */
    @Transactional
    public MessageResponse sendMessage(String senderId, SendMessageRequest request) {
        // Lấy hoặc tạo conversation
        String conversationId = request.getConversationId();
        Conversation conversation;
        
        if (conversationId == null || conversationId.isEmpty()) {
            if (request.getRecipientId() == null || request.getRecipientId().isEmpty()) {
                throw new ChatException("Either conversationId or recipientId is required");
            }
            
            // Tạo conversation mới
            CreateConversationRequest createRequest = CreateConversationRequest.builder()
                    .recipientId(request.getRecipientId())
                    .build();
            ConversationResponse convResponse = getOrCreateConversation(senderId, createRequest);
            conversationId = convResponse.getId();
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ChatException("Conversation not found"));
        } else {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ChatException("Conversation not found"));
            
            // Kiểm tra sender có trong conversation không
            if (!conversation.getParticipantIds().contains(senderId)) {
                throw new ChatException("You are not a participant of this conversation");
            }
        }
        
        // Tạo message content
        List<MessageContent> contents = buildMessageContents(request);
        
        // Xử lý reply
        ReplyInfo replyInfo = null;
        if (request.getReplyToMessageId() != null) {
            replyInfo = buildReplyInfo(request.getReplyToMessageId());
        }
        
        // Tạo message
        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .type(determineMessageType(request.getContentType()))
                .contents(contents)
                .replyTo(replyInfo)
                .status(MessageStatus.SENT)
                .sentAt(Instant.now())
                .readBy(new ArrayList<>(Collections.singletonList(senderId)))
                .build();
        
        Message savedMessage = messageRepository.save(message);
        
        // Cập nhật conversation
        updateConversationAfterMessage(conversation, savedMessage);
        
        // Tạo response
        MessageResponse response = chatMapper.toMessageResponse(savedMessage);
        enrichMessageResponse(response, senderId);
        
        // Gửi tin nhắn realtime qua WebSocket đến tất cả participants
        sendMessageToParticipants(conversation, response);
        
        log.info("Message sent: {} in conversation: {}", savedMessage.getId(), conversationId);
        
        return response;
    }

    /**
     * Lấy danh sách tin nhắn trong conversation.
     */
    public PageResponse<MessageResponse> getMessages(String conversationId, String userId, int page, int size) {
        // Kiểm tra user có trong conversation không
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ChatException("Conversation not found"));
        
        if (!conversation.getParticipantIds().contains(userId)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConversationIdAndDeletedFalseOrderBySentAtDesc(
                conversationId, pageRequest);
        
        List<MessageResponse> responses = messagePage.getContent().stream()
                .map(chatMapper::toMessageResponse)
                .peek(response -> enrichMessageResponse(response, response.getSenderId()))
                .collect(Collectors.toList());
        
        return PageResponse.<MessageResponse>builder()
                .content(responses)
                .page(page)
                .size(size)
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .first(messagePage.isFirst())
                .last(messagePage.isLast())
                .hasNext(messagePage.hasNext())
                .hasPrevious(messagePage.hasPrevious())
                .build();
    }

    /**
     * Đánh dấu tin nhắn đã đọc.
     */
    @Transactional
    public void markMessagesAsRead(String conversationId, String userId, List<String> messageIds) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ChatException("Conversation not found"));
        
        if (!conversation.getParticipantIds().contains(userId)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        List<Message> messagesToUpdate;
        
        if (messageIds == null || messageIds.isEmpty()) {
            // Đánh dấu tất cả tin nhắn chưa đọc
            messagesToUpdate = messageRepository.findUnreadMessages(conversationId, userId);
        } else {
            // Đánh dấu các tin nhắn cụ thể
            messagesToUpdate = messageRepository.findAllById(messageIds);
        }
        
        Instant now = Instant.now();
        for (Message message : messagesToUpdate) {
            if (!message.getReadBy().contains(userId)) {
                message.getReadBy().add(userId);
                if (message.getReadAt() == null) {
                    message.setReadAt(now);
                }
                message.setStatus(MessageStatus.READ);
            }
        }
        
        messageRepository.saveAll(messagesToUpdate);
        
        // Cập nhật unread count trong conversation
        conversation.getUnreadCount().put(userId, 0);
        conversationRepository.save(conversation);
        
        // Gửi thông báo đã đọc qua WebSocket
        String lastMessageId = messagesToUpdate.isEmpty() ? null : messagesToUpdate.get(0).getId();
        MessageReadResponse readResponse = MessageReadResponse.builder()
                .conversationId(conversationId)
                .userId(userId)
                .messageId(lastMessageId)
                .readAt(now)
                .build();
        
        sendReadReceiptToParticipants(conversation, readResponse, userId);
        
        log.info("Marked {} messages as read in conversation: {} for user: {}", 
                messagesToUpdate.size(), conversationId, userId);
    }

    /**
     * Xóa tin nhắn (soft delete).
     */
    @Transactional
    public void deleteMessage(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ChatException("Message not found"));
        
        if (!message.getSenderId().equals(userId)) {
            throw new ChatException("You can only delete your own messages");
        }
        
        message.setDeleted(true);
        message.setDeletedAt(Instant.now());
        messageRepository.save(message);
        
        log.info("Message deleted: {} by user: {}", messageId, userId);
    }

    /**
     * Gửi typing indicator.
     */
    public void sendTypingIndicator(String conversationId, String userId, boolean typing) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ChatException("Conversation not found"));
        
        if (!conversation.getParticipantIds().contains(userId)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        TypingIndicatorResponse response = TypingIndicatorResponse.builder()
                .conversationId(conversationId)
                .userId(userId)
                .typing(typing)
                .build();
        
        // Gửi đến tất cả participants khác
        for (String participantId : conversation.getParticipantIds()) {
            if (!participantId.equals(userId)) {
                messagingTemplate.convertAndSendToUser(
                        participantId,
                        "/queue/typing",
                        response
                );
            }
        }
    }

    // ========================= HELPER METHODS =========================

    private Conversation createNewConversation(String currentUserId, CreateConversationRequest request) {
        Set<String> participantIds = new HashSet<>(Arrays.asList(currentUserId, request.getRecipientId()));
        
        // Lấy thông tin participants
        Set<Participant> participants = new HashSet<>();
        
        // Thêm current user
        try {
            var currentUserProfile = userServiceClient.getUserProfile(currentUserId);
            if (currentUserProfile != null && currentUserProfile.getResult() != null) {
                var profile = currentUserProfile.getResult();
                participants.add(Participant.builder()
                        .userId(currentUserId)
                        .displayName(profile.getFullName())
                        .avatarUrl(profile.avatarUrl())
                        .type(ParticipantType.USER)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to get user profile for: {}", currentUserId);
            participants.add(Participant.builder()
                    .userId(currentUserId)
                    .displayName("User")
                    .type(ParticipantType.USER)
                    .build());
        }
        
        // Thêm recipient
        try {
            var recipientProfile = userServiceClient.getUserProfile(request.getRecipientId());
            if (recipientProfile != null && recipientProfile.getResult() != null) {
                var profile = recipientProfile.getResult();
                participants.add(Participant.builder()
                        .userId(request.getRecipientId())
                        .displayName(profile.getFullName())
                        .avatarUrl(profile.avatarUrl())
                        .type(request.getRecipientType() != null ? request.getRecipientType() : ParticipantType.USER)
                        .shopId(request.getShopId())
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to get user profile for: {}", request.getRecipientId());
            participants.add(Participant.builder()
                    .userId(request.getRecipientId())
                    .displayName("User")
                    .type(request.getRecipientType() != null ? request.getRecipientType() : ParticipantType.USER)
                    .build());
        }
        
        Instant now = Instant.now();
        Map<String, Integer> unreadCount = new HashMap<>();
        unreadCount.put(currentUserId, 0);
        unreadCount.put(request.getRecipientId(), 0);
        
        return Conversation.builder()
                .participantIds(participantIds)
                .participants(participants)
                .unreadCount(unreadCount)
                .status(ConversationStatus.ACTIVE)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    private List<MessageContent> buildMessageContents(SendMessageRequest request) {
        List<MessageContent> contents = new ArrayList<>();
        
        MessageContent content = MessageContent.builder()
                .contentType(request.getContentType())
                .build();
        
        switch (request.getContentType()) {
            case TEXT:
                content.setText(request.getText());
                break;
                
            case IMAGE:
                if (request.getImage() != null) {
                    content.setImage(ImageContent.builder()
                            .fileId(request.getImage().getFileId())
                            .url(request.getImage().getUrl())
                            .thumbnailUrl(request.getImage().getThumbnailUrl())
                            .fileName(request.getImage().getFileName())
                            .fileSize(request.getImage().getFileSize())
                            .mimeType(request.getImage().getMimeType())
                            .width(request.getImage().getWidth())
                            .height(request.getImage().getHeight())
                            .caption(request.getImage().getCaption())
                            .build());
                }
                break;
                
            case PRODUCT:
                if (request.getProduct() != null) {
                    content.setProduct(fetchProductContent(request.getProduct().getProductId(), request.getProduct().getNote()));
                }
                break;
                
            case ORDER:
                if (request.getOrder() != null) {
                    content.setOrder(fetchOrderContent(request.getOrder().getOrderId(), request.getOrder().getNote()));
                }
                break;
                
            case FILE:
                if (request.getFile() != null) {
                    content.setFile(FileContent.builder()
                            .fileId(request.getFile().getFileId())
                            .url(request.getFile().getUrl())
                            .fileName(request.getFile().getFileName())
                            .fileSize(request.getFile().getFileSize())
                            .mimeType(request.getFile().getMimeType())
                            .extension(request.getFile().getExtension())
                            .previewUrl(request.getFile().getPreviewUrl())
                            .build());
                }
                break;
                
            default:
                content.setText(request.getText());
        }
        
        contents.add(content);
        return contents;
    }

    private ProductContent fetchProductContent(String productId, String note) {
        try {
            var response = productServiceClient.getProductInfo(productId);
            if (response != null && response.getResult() != null) {
                var product = response.getResult();
                
                // Lấy primary image URL
                String imageUrl = null;
                List<String> imageUrls = null;
                if (product.images() != null && !product.images().isEmpty()) {
                    imageUrl = product.images().stream()
                            .filter(img -> img.isPrimary() != null && img.isPrimary())
                            .findFirst()
                            .map(ProductServiceClient.ProductImageInfo::url)
                            .orElse(product.images().get(0).url());
                    imageUrls = product.images().stream()
                            .map(ProductServiceClient.ProductImageInfo::url)
                            .collect(Collectors.toList());
                }
                
                // Xác định price từ variants hoặc minPrice
                BigDecimal price = product.minPrice();
                BigDecimal originalPrice = product.maxPrice();
                if (product.variants() != null && !product.variants().isEmpty()) {
                    var firstVariant = product.variants().get(0);
                    price = firstVariant.price();
                    originalPrice = firstVariant.originalPrice();
                }
                
                return ProductContent.builder()
                        .productId(product.id())
                        .productName(product.name())
                        .description(product.shortDescription() != null ? product.shortDescription() : product.description())
                        .price(price)
                        .originalPrice(originalPrice)
                        .currency("VND")
                        .imageUrl(imageUrl)
                        .imageUrls(imageUrls)
                        .shopId(product.store() != null ? product.store().id() : null)
                        .shopName(product.store() != null ? product.store().name() : null)
                        .status(product.isActive() ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK)
                        .soldCount(product.soldCount())
                        .rating(product.averageRating())
                        .ratingCount(product.ratingCount())
                        .productUrl("/products/" + productId)
                        .note(note)
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch product info for: {}", productId, e);
        }
        
        // Trả về thông tin cơ bản nếu không lấy được từ service
        return ProductContent.builder()
                .productId(productId)
                .productName("Product")
                .note(note)
                .build();
    }

    private OrderContent fetchOrderContent(String orderId, String note) {
        try {
            var response = orderServiceClient.getOrderInfo(orderId);
            if (response != null && response.getResult() != null) {
                var order = response.getResult();
                
                List<OrderItem> items = order.items() != null 
                        ? order.items().stream()
                                .map(item -> OrderItem.builder()
                                        .productId(item.productId())
                                        .productName(item.productName())
                                        .imageUrl(item.productImage())
                                        .quantity(item.quantity())
                                        .unitPrice(item.price())
                                        .totalPrice(item.totalPrice())
                                        .variantName(item.variantName())
                                        .sku(item.sku())
                                        .build())
                                .collect(Collectors.toList())
                        : null;
                
                // Tạo shipping info từ order fields
                ShippingInfo shipping = ShippingInfo.builder()
                        .recipientName(order.receiverName())
                        .recipientPhone(order.receiverPhone())
                        .address(order.shippingAddress())
                        .build();
                
                return OrderContent.builder()
                        .orderId(order.id())
                        .orderCode(order.orderNumber())
                        .status(order.status() != null ? OrderStatus.valueOf(order.status()) : null)
                        .totalAmount(order.totalAmount())
                        .currency("VND")
                        .items(items)
                        .itemCount(items != null ? items.size() : 0)
                        .shopId(order.storeId())
                        .shopName(order.storeName())
                        .orderedAt(order.createdAt() != null ? order.createdAt().toInstant(java.time.ZoneOffset.UTC) : null)
                        .orderUrl("/orders/" + orderId)
                        .shipping(shipping)
                        .note(note)
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch order info for: {}", orderId, e);
        }
        
        // Trả về thông tin cơ bản nếu không lấy được từ service
        return OrderContent.builder()
                .orderId(orderId)
                .note(note)
                .build();
    }

    private ReplyInfo buildReplyInfo(String replyToMessageId) {
        Message originalMessage = messageRepository.findById(replyToMessageId).orElse(null);
        
        if (originalMessage == null) {
            return null;
        }
        
        String preview = getMessagePreview(originalMessage);
        String thumbnailUrl = null;
        
        if (originalMessage.getContents() != null && !originalMessage.getContents().isEmpty()) {
            MessageContent firstContent = originalMessage.getContents().get(0);
            if (firstContent.getImage() != null) {
                thumbnailUrl = firstContent.getImage().getThumbnailUrl();
            }
        }
        
        return ReplyInfo.builder()
                .messageId(originalMessage.getId())
                .senderId(originalMessage.getSenderId())
                .type(originalMessage.getType())
                .preview(preview)
                .thumbnailUrl(thumbnailUrl)
                .build();
    }

    private MessageType determineMessageType(ContentType contentType) {
        return switch (contentType) {
            case TEXT -> MessageType.TEXT;
            case IMAGE -> MessageType.IMAGE;
            case PRODUCT -> MessageType.PRODUCT;
            case ORDER -> MessageType.ORDER;
            case FILE -> MessageType.FILE;
            case STICKER -> MessageType.STICKER;
        };
    }

    private void updateConversationAfterMessage(Conversation conversation, Message message) {
        // Cập nhật last message
        LastMessage lastMessage = LastMessage.builder()
                .messageId(message.getId())
                .senderId(message.getSenderId())
                .preview(getMessagePreview(message))
                .type(message.getType())
                .sentAt(message.getSentAt())
                .build();
        
        conversation.setLastMessage(lastMessage);
        conversation.setUpdatedAt(Instant.now());
        
        // Tăng unread count cho những người không phải sender
        for (String participantId : conversation.getParticipantIds()) {
            if (!participantId.equals(message.getSenderId())) {
                int currentCount = conversation.getUnreadCount().getOrDefault(participantId, 0);
                conversation.getUnreadCount().put(participantId, currentCount + 1);
            }
        }
        
        conversationRepository.save(conversation);
    }

    private String getMessagePreview(Message message) {
        if (message.getContents() == null || message.getContents().isEmpty()) {
            return "";
        }
        
        MessageContent firstContent = message.getContents().get(0);
        
        return switch (firstContent.getContentType()) {
            case TEXT -> firstContent.getText() != null 
                    ? (firstContent.getText().length() > 50 
                            ? firstContent.getText().substring(0, 50) + "..." 
                            : firstContent.getText())
                    : "";
            case IMAGE -> "[Hình ảnh]";
            case PRODUCT -> "[Sản phẩm] " + (firstContent.getProduct() != null 
                    ? firstContent.getProduct().getProductName() : "");
            case ORDER -> "[Đơn hàng] " + (firstContent.getOrder() != null 
                    ? firstContent.getOrder().getOrderCode() : "");
            case FILE -> "[File] " + (firstContent.getFile() != null 
                    ? firstContent.getFile().getFileName() : "");
            case STICKER -> "[Sticker]";
        };
    }

    private void enrichMessageResponse(MessageResponse response, String senderId) {
        try {
            var userProfile = userServiceClient.getUserProfile(senderId);
            if (userProfile != null && userProfile.getResult() != null) {
                var profile = userProfile.getResult();
                response.setSenderName(profile.getFullName());
                response.setSenderAvatar(profile.avatarUrl());
            }
        } catch (Exception e) {
            log.warn("Failed to enrich message with user profile: {}", senderId);
        }
    }

    private void sendMessageToParticipants(Conversation conversation, MessageResponse message) {
        for (String participantId : conversation.getParticipantIds()) {
            messagingTemplate.convertAndSendToUser(
                    participantId,
                    "/queue/messages",
                    message
            );
        }
    }

    private void sendReadReceiptToParticipants(Conversation conversation, MessageReadResponse readResponse, String excludeUserId) {
        for (String participantId : conversation.getParticipantIds()) {
            if (!participantId.equals(excludeUserId)) {
                messagingTemplate.convertAndSendToUser(
                        participantId,
                        "/queue/read-receipts",
                        readResponse
                );
            }
        }
    }
}
