package com.vdt2025.common_dto.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "file-service", contextId = "fileServiceClient", path = "/files")
public interface FileServiceClient {
    @GetMapping("/view/{fileName}")
    ApiResponse<String> getFilePath(@PathVariable String fileName);
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<String> uploadFile(@RequestPart("file") MultipartFile file);
    @PostMapping(value = "/upload/public", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileInfoResponse> uploadPublicFile(@RequestPart("file") MultipartFile file);
}
