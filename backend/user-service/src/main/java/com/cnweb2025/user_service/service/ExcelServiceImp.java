package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.user.UserCreationRequest;
import com.cnweb2025.user_service.dto.response.UserResponse;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.ZoneId;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExcelServiceImp implements ExcelService{
    PasswordEncoder encoder;
    UserServiceImp userService;
    AdminServiceImp adminService;
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public String importUsersFromExcel(MultipartFile file) {
        log.info("Importing users from Excel file: {}", file.getOriginalFilename());
        try (InputStream inputStream = file.getInputStream()){
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            XSSFSheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            if (rowIterator.hasNext()) {
                rowIterator.next(); // Skip header row
            }
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                UserCreationRequest request = new UserCreationRequest();
                request.setUsername(row.getCell(0).getStringCellValue());
                request.setPassword(encoder.encode(row.getCell(1).getStringCellValue()));
                request.setFirstName(row.getCell(2).getStringCellValue());
                request.setLastName(row.getCell(3).getStringCellValue());
                Date birthDate = row.getCell(4).getDateCellValue();
                if (birthDate != null) {
                    request.setDob(birthDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
                }
                request.setEmail(row.getCell(5).getStringCellValue());
                request.setPhone(row.getCell(6).getStringCellValue());
                userService.createUser(request);
            }
        } catch (Exception e) {
            log.error("Error importing users from Excel file: {}", file.getOriginalFilename(), e);
            throw new AppException(ErrorCode.EXCEL_IMPORT_ERROR);
        }
        return "Users imported successfully from " + file.getOriginalFilename();
    }

    @Override
    public String exportUsersToExcel(HttpServletResponse response) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            List<UserResponse> users = adminService.getUsers();
            XSSFSheet sheet = workbook.createSheet("Users");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"id", "username", "firstname", "lastname", "dob", "phone", "email", "avatar_name", "enabled", "created_at", "updated_at", "role"};
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            // Populate data rows
            int rowNum = 1;
            for (UserResponse user : users) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(user.getId());
                row.createCell(1).setCellValue(user.getUsername());
                row.createCell(2).setCellValue(user.getFirstName());
                row.createCell(3).setCellValue(user.getLastName());
                if (user.getDob() != null) {
                    row.createCell(4).setCellValue(user.getDob().toString());
                } else {
                    row.createCell(4).setCellValue("");
                }
                row.createCell(5).setCellValue(user.getPhone());
                row.createCell(6).setCellValue(user.getEmail());
                row.createCell(7).setCellValue(user.getAvatarName() != null ? user.getAvatarName() : "");
//                row.createCell(8).setCellValue(user.isEnabled() ? "Yes" : "No");
                row.createCell(9).setCellValue(user.getCreatedAt().toString());
                row.createCell(10).setCellValue(user.getUpdatedAt().toString());
//                row.createCell(11).setCellValue(user.getRole().getName());
            }
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
            workbook.write(response.getOutputStream());
        } catch (Exception e) {
            log.error("Error exporting users to Excel", e);
            throw new AppException(ErrorCode.EXCEL_EXPORT_ERROR);
        }
        return "Users exported successfully to Excel file";
    }
}
