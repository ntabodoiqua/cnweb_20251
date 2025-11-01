package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.response.ProvinceResponse;
import com.cnweb2025.user_service.entity.Province;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
    ProvinceResponse toProvinceResponse(Province province);
}
