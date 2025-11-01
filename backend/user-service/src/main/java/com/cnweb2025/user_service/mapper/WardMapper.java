package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.response.WardResponse;
import com.cnweb2025.user_service.entity.Ward;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProvinceMapper.class})
public interface WardMapper {
    WardResponse toWardResponse(Ward ward);
}
