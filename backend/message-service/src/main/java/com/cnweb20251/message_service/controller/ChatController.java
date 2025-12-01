package com.cnweb20251.message_service.controller;

import com.cnweb20251.message_service.dto.request.CreateConversationRequest;
import com.cnweb20251.message_service.dto.request.MarkAsReadRequest;
import com.cnweb20251.message_service.dto.request.SendMessageRequest;
import com.cnweb20251.message_service.dto.response.*;
import com.cnweb20251.message_service.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller cho Chat API.
 * Chỉ hỗ trợ chat giữa buyer (người mua) và shop (seller).
 * Sử dụng cho các thao tác không realtime như lấy lịch sử tin nhắn, tạo conversation, etc.
 */
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat", description = "Chat API - Chat giữa người mua và shop")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;

    // ========================= CONVERSATION ENDPOINTS =========================

    /**
     * Tạo hoặc lấy conversation với shop.
     * Chỉ buyer (người mua) mới có thể tạo conversation.
     * Shop owner không thể tạo conversation với shop của chính mình.
     */
    @PostMapping("/conversations")
    @Operation(summary = "Tạo hoặc lấy conversation với shop", 
               description = "Tạo conversation mới giữa buyer và shop, hoặc lấy conversation đã tồn tại")
    public ResponseEntity<ApiResponse<ConversationResponse>> getOrCreateConversation(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateConversationRequest request) {
        
        String userId = jwt.getSubject();
        ConversationResponse response = chatService.getOrCreateConversation(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy danh sách conversations của user hiện tại.
     */
    @GetMapping("/conversations")
    @Operation(summary = "Lấy danh sách conversations", description = "Lấy danh sách tất cả conversations của user hiện tại")
    public ResponseEntity<ApiResponse<PageResponse<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String userId = jwt.getSubject();
        PageResponse<ConversationResponse> response = chatService.getUserConversations(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy chi tiết một conversation.
     */
    @GetMapping("/conversations/{conversationId}")
    @Operation(summary = "Lấy chi tiết conversation", description = "Lấy thông tin chi tiết của một conversation")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String conversationId) {
        
        String userId = jwt.getSubject();
        ConversationResponse response = chatService.getConversation(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========================= MESSAGE ENDPOINTS =========================

    /**
     * Gửi tin nhắn mới (qua REST API, có thể dùng thay cho WebSocket).
     */
    @PostMapping("/messages")
    @Operation(summary = "Gửi tin nhắn", description = "Gửi tin nhắn mới trong conversation")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SendMessageRequest request) {
        
        String userId = jwt.getSubject();
        MessageResponse response = chatService.sendMessage(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy danh sách tin nhắn trong conversation.
     */
    @GetMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Lấy tin nhắn", description = "Lấy danh sách tin nhắn trong một conversation (phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getMessages(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        String userId = jwt.getSubject();
        PageResponse<MessageResponse> response = chatService.getMessages(conversationId, userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Đánh dấu tin nhắn đã đọc.
     */
    @PostMapping("/messages/read")
    @Operation(summary = "Đánh dấu đã đọc", description = "Đánh dấu tin nhắn trong conversation đã được đọc")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody MarkAsReadRequest request) {
        
        String userId = jwt.getSubject();
        chatService.markMessagesAsRead(request.getConversationId(), userId, request.getMessageIds());
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    /**
     * Xóa tin nhắn.
     */
    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "Xóa tin nhắn", description = "Xóa tin nhắn của chính mình (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String messageId) {
        
        String userId = jwt.getSubject();
        chatService.deleteMessage(messageId, userId);
        return ResponseEntity.ok(ApiResponse.success("Message deleted", null));
    }
}
