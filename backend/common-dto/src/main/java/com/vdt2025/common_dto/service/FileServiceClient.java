package com.vdt2025.common_dto.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "file-service", contextId = "fileServiceClient", path = "/files")
public interface FileServiceClient {
    @GetMapping("/path/{fileName}")
    ApiResponse<String> getFilePath(@PathVariable String fileName);
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<String> uploadFile(@RequestPart("file") MultipartFile file);
}
