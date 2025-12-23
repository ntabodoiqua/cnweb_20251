package com.cnweb2025.notification_service.mapper;

import com.cnweb2025.notification_service.dto.NotificationDTO;
import com.cnweb2025.notification_service.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "icon", expression = "java(notification.getType() != null ? notification.getType().getIcon() : null)")
    @Mapping(target = "typeDisplayName", expression = "java(notification.getType() != null ? notification.getType().getDisplayName() : null)")
    NotificationDTO toDTO(Notification notification);

    List<NotificationDTO> toDTOList(List<Notification> notifications);
}