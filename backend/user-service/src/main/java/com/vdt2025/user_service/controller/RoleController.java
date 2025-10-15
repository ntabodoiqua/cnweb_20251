package com.vdt2025.user_service.controller;

import com.vdt2025.user_service.dto.ApiResponse;
import com.vdt2025.user_service.dto.request.role.RoleRequest;
import com.vdt2025.user_service.dto.response.RoleResponse;
import com.vdt2025.user_service.service.RoleServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleServiceImp roleService;

    // Tạo vai trò mới
    @PostMapping
    public ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request) {
        log.info("Creating role with name: {}", request.getName());
        var roleResponse = roleService.createRole(request);
        return ApiResponse.<RoleResponse>builder()
                .result(roleResponse)
                .build();
    }

    // Lấy danh sách tất cả vai trò
    @GetMapping
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        log.info("Retrieving all roles");
        var roles = roleService.getAllRoles();
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roles)
                .build();
    }

    // Xóa vai trò theo id
    @DeleteMapping("/{roleName}")
    public ApiResponse<String> deleteRole(@PathVariable String roleName) {
        log.info("Deleting role with name: {}", roleName);
        roleService.delete(roleName);
        return ApiResponse.<String>builder()
                .result("Role has been deleted")
                .build();

    }

    // Cập nhật vai trò
    @PutMapping("/{roleName}")
    public ApiResponse<RoleResponse> updateRole(@PathVariable String roleName, @RequestBody RoleRequest request) {
        log.info("Updating role with name: {}", request.getName());
        var updatedRole = roleService.updateRole(roleName, request);
        return ApiResponse.<RoleResponse>builder()
                .result(updatedRole)
                .build();
    }

    // Lấy thông tin vai trò theo id
    @GetMapping("/{roleName}")
    public ApiResponse<RoleResponse> getRoleByName(@PathVariable String roleName) {
        log.info("Retrieving role with name: {}", roleName);
        var role = roleService.getRoleByName(roleName);
        return ApiResponse.<RoleResponse>builder()
                .result(role)
                .build();
    }
}
