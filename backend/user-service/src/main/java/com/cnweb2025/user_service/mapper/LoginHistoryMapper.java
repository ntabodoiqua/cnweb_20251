package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.response.LoginHistoryResponse;
import com.cnweb2025.user_service.entity.LoginHistory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LoginHistoryMapper {
    LoginHistoryResponse toResponse(LoginHistory loginHistory);
}
