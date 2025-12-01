package com.cnweb20251.message_service.mapper;

import com.cnweb20251.message_service.dto.response.ConversationResponse;
import com.cnweb20251.message_service.dto.response.MessageResponse;
import com.cnweb20251.message_service.entity.*;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper để chuyển đổi giữa Entity và DTO.
 */
@Mapper(componentModel = "spring")
public interface ChatMapper {

    /**
     * Chuyển Message entity sang MessageResponse DTO.
     */
    @Mapping(target = "senderName", ignore = true)
    @Mapping(target = "senderAvatar", ignore = true)
    @Mapping(target = "contents", source = "contents", qualifiedByName = "mapContents")
    @Mapping(target = "replyTo", source = "replyTo", qualifiedByName = "mapReplyInfo")
    MessageResponse toMessageResponse(Message message);

    /**
     * Chuyển Conversation entity sang ConversationResponse DTO.
     */
    @Mapping(target = "participants", source = "participants", qualifiedByName = "mapParticipants")
    @Mapping(target = "lastMessage", source = "lastMessage", qualifiedByName = "mapLastMessage")
    ConversationResponse toConversationResponse(Conversation conversation);

    @Named("mapContents")
    default java.util.List<MessageResponse.MessageContentResponse> mapContents(java.util.List<MessageContent> contents) {
        if (contents == null) return null;
        return contents.stream().map(this::mapContent).collect(Collectors.toList());
    }

    default MessageResponse.MessageContentResponse mapContent(MessageContent content) {
        if (content == null) return null;
        return MessageResponse.MessageContentResponse.builder()
                .contentType(content.getContentType() != null ? content.getContentType().name() : null)
                .text(content.getText())
                .image(content.getImage())
                .product(content.getProduct())
                .order(content.getOrder())
                .file(content.getFile())
                .sticker(content.getSticker())
                .build();
    }

    @Named("mapReplyInfo")
    default MessageResponse.ReplyInfoResponse mapReplyInfo(ReplyInfo replyInfo) {
        if (replyInfo == null) return null;
        return MessageResponse.ReplyInfoResponse.builder()
                .messageId(replyInfo.getMessageId())
                .senderId(replyInfo.getSenderId())
                .senderName(replyInfo.getSenderName())
                .type(replyInfo.getType() != null ? replyInfo.getType().name() : null)
                .preview(replyInfo.getPreview())
                .thumbnailUrl(replyInfo.getThumbnailUrl())
                .build();
    }

    @Named("mapParticipants")
    default Set<ConversationResponse.ParticipantResponse> mapParticipants(Set<Participant> participants) {
        if (participants == null) return null;
        return participants.stream().map(this::mapParticipant).collect(Collectors.toSet());
    }

    default ConversationResponse.ParticipantResponse mapParticipant(Participant participant) {
        if (participant == null) return null;
        return ConversationResponse.ParticipantResponse.builder()
                .userId(participant.getUserId())
                .displayName(participant.getDisplayName())
                .avatarUrl(participant.getAvatarUrl())
                .type(participant.getType() != null ? participant.getType().name() : null)
                .shopId(participant.getShopId())
                .shopName(participant.getShopName())
                .online(false) // Sẽ được cập nhật sau từ presence service
                .build();
    }

    @Named("mapLastMessage")
    default ConversationResponse.LastMessageResponse mapLastMessage(LastMessage lastMessage) {
        if (lastMessage == null) return null;
        return ConversationResponse.LastMessageResponse.builder()
                .messageId(lastMessage.getMessageId())
                .senderId(lastMessage.getSenderId())
                .senderName(null) // Sẽ được cập nhật sau
                .preview(lastMessage.getPreview())
                .type(lastMessage.getType() != null ? lastMessage.getType().name() : null)
                .sentAt(lastMessage.getSentAt())
                .build();
    }
}
