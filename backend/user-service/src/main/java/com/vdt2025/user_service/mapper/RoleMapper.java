package com.vdt2025.user_service.mapper;

import com.vdt2025.user_service.dto.request.role.RoleRequest;
import com.vdt2025.user_service.dto.response.RoleResponse;
import com.vdt2025.user_service.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")

public interface RoleMapper {
    Role toRole(RoleRequest request);
    RoleResponse toRoleResponse(Role role);
}
