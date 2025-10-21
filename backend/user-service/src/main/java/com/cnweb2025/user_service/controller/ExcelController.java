package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.service.ExcelServiceImp;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExcelController {
    ExcelServiceImp excelService;

    @PostMapping("/import")
    public ApiResponse<String> importExcel(@RequestParam("file") MultipartFile file) {
        log.info("Starting import Excel file");
        String result = excelService.importUsersFromExcel(file);
        log.info("Excel file imported successfully: {}", result);
        return ApiResponse.<String>builder()
                .result(result)
                .message("Excel file imported successfully")
                .build();
    }

    @GetMapping("/export")
    public ApiResponse<String> exportExcel(HttpServletResponse response) {
        log.info("Starting export to Excel file");
        String result = excelService.exportUsersToExcel(response);
        log.info("Excel file exported successfully: {}", result);
        return ApiResponse.<String>builder()
                .result(result)
                .message("Excel file exported successfully")
                .build();
    }
}
