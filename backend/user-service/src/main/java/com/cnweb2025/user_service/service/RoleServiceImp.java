package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.role.RoleRequest;
import com.cnweb2025.user_service.dto.response.RoleResponse;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.RoleMapper;
import com.cnweb2025.user_service.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImp implements RoleService{
    RoleRepository roleRepository;
    RoleMapper roleMapper;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsById(request.getName())) {
            log.warn("Role {} already exists", request.getName());
            throw new AppException(ErrorCode.ROLE_EXISTED);

        }
        var role = roleMapper.toRole(request);
        roleRepository.save(role);
        log.info("Role {} created successfully", role.getName());
        return roleMapper.toRoleResponse(role);
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        var roles = roleRepository.findAll();
        log.info("Retrieved {} roles", roles.size());
        return roles.stream()
                .map(roleMapper::toRoleResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(String roleName) {
        if (!roleRepository.existsById(roleName)) {
            log.warn("Role {} does not exist", roleName);
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        // Kiểm tra xem có người dùng nào đang sử dụng vai trò này không
        // Nếu có, không cho phép xóa
        if (roleRepository.countUsersWithRole(roleName) > 0) {
            log.warn("Cannot delete role {} because it is assigned to users", roleName);
            throw new AppException(ErrorCode.ROLE_IN_USE);
        }
        roleRepository.deleteById(roleName);
        log.info("Role {} deleted successfully", roleName);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse updateRole(String roleName, RoleRequest request) {
        if (!roleRepository.existsById(roleName)) {
            log.warn("Role {} does not exist", request.getName());
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        var role = roleMapper.toRole(request);
        // Kiểm tra xem role mới có tên trùng với role đã tồn tại
        // khác với tên hiện tại không
        if (!roleName.equals(role.getName()) && roleRepository.existsById(role.getName())) {
            log.warn("Role {} already exists", role.getName());
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }
        roleRepository.save(role);
        log.info("Role {} updated successfully", role.getName());
        return roleMapper.toRoleResponse(role);
    }

    @Override
    public RoleResponse getRoleByName(String roleName) {
        var role = roleRepository.findById(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        log.info("Retrieved role {}", role.getName());
        return roleMapper.toRoleResponse(role);
    }

}
