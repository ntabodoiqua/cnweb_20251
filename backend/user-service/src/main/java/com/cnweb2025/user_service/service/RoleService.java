package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.role.RoleRequest;
import com.cnweb2025.user_service.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    RoleResponse createRole(RoleRequest request);

    List<RoleResponse> getAllRoles();

    void delete(String roleName);

    RoleResponse getRoleByName(String roleName);

    RoleResponse updateRole(String roleName, RoleRequest request);

}
