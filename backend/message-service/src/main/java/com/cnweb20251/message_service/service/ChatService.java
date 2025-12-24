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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý logic chat chính.
 * Chỉ hỗ trợ chat giữa người mua (USER) và người bán (SELLER/Shop).
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
     * Tạo hoặc lấy conversation giữa người mua và shop.
     * Chỉ cho phép chat giữa USER và SELLER.
     */
    @Transactional
    public ConversationResponse getOrCreateConversation(CreateConversationRequest request) {
        String shopId = request.getShopId();
        
        // Lấy thông tin shop và owner
        var storeInfo = getStoreInfo(shopId);
        if (storeInfo == null) {
            throw new ChatException("Shop not found: " + shopId);
        }

        String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();

        // Kiểm tra user hiện tại có phải owner của shop không
        boolean isShopOwner = storeInfo.userName().equals(currentUserName);
        String shopOwnerUsername = storeInfo.userName();
        
        if (isShopOwner) {
            throw new ChatException("You cannot create a conversation with your own shop");
        }
        
        // Tìm conversation dựa trên shopId (unique per user-shop pair)
        Optional<Conversation> existingConversation = conversationRepository.findByShopIdAndBuyerUsername(shopId, currentUserName);
        
        if (existingConversation.isPresent()) {
            return chatMapper.toConversationResponse(existingConversation.get());
        }
        
        // Tạo conversation mới giữa buyer và shop
        Conversation conversation = createBuyerSellerConversation(currentUserName, shopId, shopOwnerUsername, storeInfo);
        Conversation savedConversation = conversationRepository.save(conversation);
        
        log.info("Created new buyer-seller conversation: {} between buyer {} and shop {}", 
                savedConversation.getId(), currentUserName, shopId);
        
        return chatMapper.toConversationResponse(savedConversation);
    }

    /**
     * Lấy danh sách conversations của user.
     * Nếu user là shop owner, lấy cả conversations của shop.
     */
    public PageResponse<ConversationResponse> getUserConversations(String userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        
        // Lấy shopId nếu user là shop owner
        String userShopId = getUserShopId(userId);
        
        Page<Conversation> conversationPage;
        if (userShopId != null) {
            // User là shop owner -> lấy conversations của shop
            log.info("User {} is shop owner of shop {}, fetching shop conversations", userId, userShopId);
            conversationPage = conversationRepository.findByShopId(userShopId, pageRequest);
        } else {
            // User là buyer -> lấy conversations của buyer (sử dụng username)
            conversationPage = conversationRepository.findByBuyerUsername(userId, pageRequest);
        }
        
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
        
        // Kiểm tra user có trong conversation không (là buyer hoặc shop owner)
        if (!isUserInConversation(userId, conversation)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        return chatMapper.toConversationResponse(conversation);
    }

    // ========================= MESSAGE METHODS =========================

    /**
     * Gửi tin nhắn mới.
     * Chỉ cho phép gửi tin nhắn trong conversation đã tồn tại (giữa buyer và shop).
     */
    @Transactional
    public MessageResponse sendMessage(String senderId, SendMessageRequest request) {
        String conversationId = request.getConversationId();
        
        if (conversationId == null || conversationId.isEmpty()) {
            throw new ChatException("Conversation ID is required. Please create a conversation first.");
        }
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ChatException("Conversation not found"));
        
        // Kiểm tra sender có trong conversation không (buyer hoặc shop owner)
        if (!isUserInConversation(senderId, conversation)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        // Lấy effective participant ID (shopId nếu là shop owner)
        String effectiveSenderId = getEffectiveParticipantId(senderId, conversation);
        
        // Tạo message content
        List<MessageContent> contents = buildMessageContents(request);
        
        // Xử lý reply
        ReplyInfo replyInfo = null;
        if (request.getReplyToMessageId() != null) {
            replyInfo = buildReplyInfo(request.getReplyToMessageId());
        }
        
        // Tạo message - sử dụng effectiveSenderId (shopId nếu là shop owner)
        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(effectiveSenderId)
                .type(determineMessageType(request.getContentType()))
                .contents(contents)
                .replyTo(replyInfo)
                .status(MessageStatus.SENT)
                .sentAt(Instant.now())
                .readBy(new ArrayList<>(Collections.singletonList(effectiveSenderId)))
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
        
        if (!isUserInConversation(userId, conversation)) {
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
        
        if (!isUserInConversation(userId, conversation)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        // Lấy effective participant ID
        String effectiveUserId = getEffectiveParticipantId(userId, conversation);
        
        List<Message> messagesToUpdate;
        
        if (messageIds == null || messageIds.isEmpty()) {
            // Đánh dấu tất cả tin nhắn chưa đọc
            messagesToUpdate = messageRepository.findUnreadMessages(conversationId, effectiveUserId);
        } else {
            // Đánh dấu các tin nhắn cụ thể
            messagesToUpdate = messageRepository.findAllById(messageIds);
        }
        
        Instant now = Instant.now();
        for (Message message : messagesToUpdate) {
            if (!message.getReadBy().contains(effectiveUserId)) {
                message.getReadBy().add(effectiveUserId);
                if (message.getReadAt() == null) {
                    message.setReadAt(now);
                }
                message.setStatus(MessageStatus.READ);
            }
        }
        
        messageRepository.saveAll(messagesToUpdate);
        
        // Cập nhật unread count trong conversation
        conversation.getUnreadCount().put(effectiveUserId, 0);
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
        
        // Kiểm tra user có quyền xóa tin nhắn không
        // User có thể xóa nếu là sender hoặc là shop owner của sender (nếu sender là shopId)
        String effectiveUserId = userId;
        String userShopId = getUserShopId(userId);
        if (userShopId != null) {
            effectiveUserId = userShopId;
        }
        
        if (!message.getSenderId().equals(userId) && !message.getSenderId().equals(effectiveUserId)) {
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
        
        if (!isUserInConversation(userId, conversation)) {
            throw new ChatException("You are not a participant of this conversation");
        }
        
        String effectiveUserId = getEffectiveParticipantId(userId, conversation);
        
        TypingIndicatorResponse response = TypingIndicatorResponse.builder()
                .conversationId(conversationId)
                .userId(effectiveUserId)
                .typing(typing)
                .build();
        
        // Gửi đến buyer nếu không phải người gõ
        String buyerUsername = conversation.getBuyerUsername();
        if (buyerUsername != null && !buyerUsername.equals(userId)) {
            messagingTemplate.convertAndSendToUser(
                    buyerUsername,
                    "/queue/typing",
                    response
            );
        }
        
        // Gửi đến shop owner nếu không phải người gõ
        String shopOwnerUsername = conversation.getShopOwnerUsername();
        if (shopOwnerUsername != null && !shopOwnerUsername.equals(userId)) {
            messagingTemplate.convertAndSendToUser(
                    shopOwnerUsername,
                    "/queue/typing",
                    response
            );
        }
    }

    // ========================= HELPER METHODS =========================

    /**
     * Lấy thông tin store từ product-service.
     */
    private ProductServiceClient.StoreDetailInfo getStoreInfo(String shopId) {
        try {
            var response = productServiceClient.getStoreInfo(shopId);
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (Exception e) {
            log.warn("Failed to get store info for: {}", shopId, e);
        }
        return null;
    }

    /**
     * Tạo conversation mới giữa buyer và shop.
     */
    private Conversation createBuyerSellerConversation(String buyerUsername,String shopId, String shopOwnerUsername, ProductServiceClient.StoreDetailInfo storeInfo) {
        // Lấy thông tin buyer
        Set<Participant> participants = new HashSet<>();
        Set<String> participantIds = new HashSet<>();
        
        // Thêm buyer
        participantIds.add(buyerUsername);
        try {
            var buyerProfile = userServiceClient.getUserProfile(buyerUsername);
            if (buyerProfile != null && buyerProfile.getResult() != null) {
                var profile = buyerProfile.getResult();
                participants.add(Participant.builder()
                        .username(buyerUsername)
                        .displayName(profile.getFullName())
                        .avatarUrl(profile.avatarUrl())
                        .type(ParticipantType.USER)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to get user profile for buyer: {}", buyerUsername);
            participants.add(Participant.builder()
                    .username(buyerUsername)
                    .displayName("Buyer")
                    .type(ParticipantType.USER)
                    .build());
        }
        
        // Thêm shop (SELLER) - sử dụng shopId làm participantId
        participantIds.add(shopOwnerUsername);
        participants.add(Participant.builder()
                .username(shopOwnerUsername)  // Sử dụng shopId làm userId cho shop
                .displayName(storeInfo.storeName())
                .avatarUrl(storeInfo.logoUrl())
                .type(ParticipantType.SELLER)
                .shopId(shopId)
                .shopName(storeInfo.storeName())
                .build());
        
        Instant now = Instant.now();
        Map<String, Integer> unreadCount = new HashMap<>();
        unreadCount.put(buyerUsername, 0);
        unreadCount.put(shopOwnerUsername, 0);
        
        return Conversation.builder()
                .participantIds(participantIds)
                .participants(participants)
                .shopId(shopId)  // Lưu shopId để tìm kiếm dễ dàng
                .shopOwnerUsername(shopOwnerUsername)  // Lưu username của shop owner
                .buyerUsername(buyerUsername)  // Lưu username của buyer
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
                            .map(ProductServiceClient.ProductImageInfo::imageUrl)
                            .orElse(product.images().get(0).imageUrl());
                    imageUrls = product.images().stream()
                            .map(ProductServiceClient.ProductImageInfo::imageUrl)
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
                        .shopName(product.store() != null ? product.store().storeName() : null)
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
        // Thử lấy thông tin từ user-service trước (nếu senderId là username/email)
        try {
            var userProfile = userServiceClient.getUserProfile(senderId);
            if (userProfile != null && userProfile.getResult() != null) {
                var profile = userProfile.getResult();
                response.setSenderName(profile.getFullName());
                response.setSenderAvatar(profile.avatarUrl());
                return;
            }
        } catch (Exception e) {
            log.debug("SenderId {} is not a user, trying as shop", senderId);
        }
        
        // Nếu không phải user, thử lấy thông tin shop (nếu senderId là shopId)
        try {
            var storeInfo = getStoreInfo(senderId);
            if (storeInfo != null) {
                response.setSenderName(storeInfo.storeName());
                response.setSenderAvatar(storeInfo.logoUrl());
                return;
            }
        } catch (Exception e) {
            log.warn("Failed to enrich message with sender info: {}", senderId);
        }
    }

    /**
     * Gửi tin nhắn WebSocket đến tất cả participants trong conversation.
     * Sử dụng username trực tiếp từ conversation.
     */
    private void sendMessageToParticipants(Conversation conversation, MessageResponse message) {
        // Gửi đến buyer (sử dụng username)
        String buyerUsername = conversation.getBuyerUsername();
        if (buyerUsername != null) {
            log.debug("Sending message to buyer: {}", buyerUsername);
            messagingTemplate.convertAndSendToUser(
                    buyerUsername,
                    "/queue/messages",
                    message
            );
        }
        
        // Gửi đến shop owner (sử dụng username đã lưu trong conversation)
        String shopOwnerUsername = conversation.getShopOwnerUsername();
        if (shopOwnerUsername != null) {
            log.debug("Sending message to shop owner: {} (shop: {})", shopOwnerUsername, conversation.getShopId());
            messagingTemplate.convertAndSendToUser(
                    shopOwnerUsername,
                    "/queue/messages",
                    message
            );
        }
    }

    /**
     * Gửi read receipt WebSocket đến tất cả participants trong conversation.
     * Sử dụng username trực tiếp từ conversation.
     */
    private void sendReadReceiptToParticipants(Conversation conversation, MessageReadResponse readResponse, String excludeUsername) {
        // Gửi đến buyer nếu không phải người đọc
        String buyerUsername = conversation.getBuyerUsername();
        if (buyerUsername != null && !buyerUsername.equals(excludeUsername)) {
            messagingTemplate.convertAndSendToUser(
                    buyerUsername,
                    "/queue/read-receipts",
                    readResponse
            );
        }
        
        // Gửi đến shop owner nếu không phải người đọc
        String shopOwnerUsername = conversation.getShopOwnerUsername();
        if (shopOwnerUsername != null && !shopOwnerUsername.equals(excludeUsername)) {
            messagingTemplate.convertAndSendToUser(
                    shopOwnerUsername,
                    "/queue/read-receipts",
                    readResponse
            );
        }
    }
    
    /**
     * Lấy ownerUsername của shop từ shopId.
     * Dùng để gửi WebSocket message đến đúng user.
     */
    private String getShopOwnerUsername(String shopId) {
        try {
            var response = productServiceClient.getOwnerUsernameByStoreId(shopId);
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (Exception e) {
            log.warn("Failed to get owner username for shop: {}", shopId, e);
        }
        return null;
    }

    // ========================= USER & SHOP HELPER METHODS =========================

    /**
     * Lấy shopId của user nếu user là shop owner.
     * Gọi product-service để lấy storeId theo username.
     * @return shopId nếu user là shop owner, null nếu không phải
     */
    private String getUserShopId(String username) {
        try {
            var response = productServiceClient.getStoreIdByUsername(username);
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (Exception e) {
            log.debug("User {} is not a shop owner or failed to get shop ID: {}", username, e.getMessage());
        }
        return null;
    }

    /**
     * Kiểm tra user có trong conversation không.
     * User có thể là buyer (username) hoặc shop owner (username).
     */
    private boolean isUserInConversation(String username, Conversation conversation) {
        // Kiểm tra trực tiếp trong participantIds
        if (conversation.getParticipantIds().contains(username)) {
            return true;
        }
        
        // Kiểm tra nếu user là buyer
        if (username.equals(conversation.getBuyerUsername())) {
            return true;
        }
        
        // Kiểm tra nếu user là shop owner
        if (username.equals(conversation.getShopOwnerUsername())) {
            return true;
        }
        
        return false;
    }

    /**
     * Lấy participantId thực tế của user trong conversation.
     * Trả về username của user (buyer hoặc shop owner).
     */
    private String getEffectiveParticipantId(String username, Conversation conversation) {
        // Nếu username là buyer
        if (username.equals(conversation.getBuyerUsername())) {
            return username;
        }
        
        // Nếu username là shop owner
        if (username.equals(conversation.getShopOwnerUsername())) {
            return username;
        }
        
        // Fallback
        return username;
    }
}
