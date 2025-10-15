package com.vdt2025.user_service.service;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ExcelService {

    String importUsersFromExcel(MultipartFile file);

    String exportUsersToExcel(HttpServletResponse response);

}
