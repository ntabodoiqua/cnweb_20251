package com.cnweb2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    // Lỗi xác thực (11xx)
    UNAUTHORIZED(1101, "You do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1102, "You are not authenticated", HttpStatus.UNAUTHORIZED),
    WRONG_PASSWORD(1103, "Wrong password", HttpStatus.UNAUTHORIZED),
    OLD_PASSWORD_SAME_AS_NEW(1104, "Old password cannot be the same as new password", HttpStatus.BAD_REQUEST),

    // Lỗi người dùng (12xx)
    USER_NOT_FOUND(1201, "User not found", HttpStatus.NOT_FOUND),
    USER_DISABLED(1202, "User is disabled", HttpStatus.FORBIDDEN),
    USER_EXISTED(1203, "User already exists", HttpStatus.CONFLICT),
    USERNAME_INVALID(1204, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1205, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_DOB(1206, "User must be at least {min} years old", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1207, "Email is invalid", HttpStatus.BAD_REQUEST),
    INVALID_PHONE(1208, "Phone number is invalid", HttpStatus.BAD_REQUEST),
    MISSING_USERNAME(1209, "Username is required", HttpStatus.BAD_REQUEST),
    MISSING_PASSWORD(1210, "Password is required", HttpStatus.BAD_REQUEST),
    USER_ALREADY_ENABLED(1211, "User is already enabled", HttpStatus.BAD_REQUEST),
    USER_ALREADY_DISABLED(1212, "User is already disabled", HttpStatus.BAD_REQUEST),
    ADMIN_CANNOT_DISABLE_SELF(1213, "Admin cannot disable themselves", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1214, "Email is not verified. Please verify your email first", HttpStatus.FORBIDDEN),
    // Lỗi OTP (13xx)
    OTP_EXPIRED(1301, "OTP code has expired or not found", HttpStatus.BAD_REQUEST),
    OTP_INVALID(1302, "Invalid OTP code", HttpStatus.BAD_REQUEST),
    // Lỗi File (14xx)
    FILE_CANNOT_STORED(1401, "File cannot be stored", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(1402, "File cannot be found", HttpStatus.NOT_FOUND),
    INVALID_IMAGE_TYPE(1403, "Invalid image type", HttpStatus.BAD_REQUEST),
    EXCEL_IMPORT_ERROR(1404, "Error importing Excel file", HttpStatus.INTERNAL_SERVER_ERROR),
    EXCEL_EXPORT_ERROR(1405, "Error exporting Excel file", HttpStatus.INTERNAL_SERVER_ERROR),
    // Lỗi vai trò (15xx)
    ROLE_NOT_FOUND(1501, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(1502, "Role already exists", HttpStatus.CONFLICT),
    ROLE_IN_USE(1503, "Role is in use by users", HttpStatus.CONFLICT),
    // Lỗi danh mục (15xx)
    CATEGORY_NOT_FOUND(1501, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_EXISTED(1602, "Category already exists", HttpStatus.CONFLICT),
    // Lỗi sản phẩm (17xx)
    PRODUCT_NOT_FOUND(1701, "Product not found", HttpStatus.NOT_FOUND),
    PRODUCT_EXISTED(1702, "Product already exists", HttpStatus.CONFLICT),
    // Lỗi khác (99xx)
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9998, "Invalid key", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(9997, "Data integrity violation", HttpStatus.CONFLICT),
    ;
    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
    public int getCode() {
        return code;
    }
    public String getMessage() {
        return message;
    }
    public HttpStatusCode getStatusCode() {
        return statusCode;
    }

    private final int code;

    private final String message;

    private final HttpStatusCode statusCode;
}
