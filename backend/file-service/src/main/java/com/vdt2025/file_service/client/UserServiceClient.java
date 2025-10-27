package com.vdt2025.file_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Set;

/**
 * Feign Client để gọi User Service và kiểm tra file references
 */
@FeignClient(name = "user-service", path = "/users")
public interface UserServiceClient {
    
    /**
     * Kiểm tra xem các file có còn được tham chiếu trong User Service không
     * @param fileNames Danh sách tên file cần kiểm tra
     * @return Set các file name còn được tham chiếu
     */
    @PostMapping("/internal/check-file-references")
    ApiResponse<Set<String>> checkFileReferences(@RequestBody List<String> fileNames);
}
