package com.cnweb2025.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    // Lỗi xác thực (11xx)
    UNAUTHORIZED(1101, "error.1101", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1102, "error.1102", HttpStatus.UNAUTHORIZED),
    WRONG_PASSWORD(1103, "error.1103", HttpStatus.UNAUTHORIZED),
    OLD_PASSWORD_SAME_AS_NEW(1104, "error.1104", HttpStatus.BAD_REQUEST),

    // Lỗi người dùng (12xx)
    USER_NOT_FOUND(1201, "error.1201", HttpStatus.NOT_FOUND),
    USER_DISABLED(1202, "error.1202", HttpStatus.FORBIDDEN),
    USER_EXISTED(1203, "error.1203", HttpStatus.CONFLICT),
    USERNAME_INVALID(1204, "error.1204", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1205, "error.1205", HttpStatus.BAD_REQUEST),
    INVALID_DOB(1206, "error.1206", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1207, "error.1207", HttpStatus.BAD_REQUEST),
    INVALID_PHONE(1208, "error.1208", HttpStatus.BAD_REQUEST),
    MISSING_USERNAME(1209, "error.1209", HttpStatus.BAD_REQUEST),
    MISSING_PASSWORD(1210, "error.1210", HttpStatus.BAD_REQUEST),
    USER_ALREADY_ENABLED(1211, "error.1211", HttpStatus.BAD_REQUEST),
    USER_ALREADY_DISABLED(1212, "error.1212", HttpStatus.BAD_REQUEST),
    ADMIN_CANNOT_DISABLE_SELF(1213, "error.1213", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1214, "error.1214", HttpStatus.FORBIDDEN),
    // Lỗi OTP (13xx)
    OTP_EXPIRED(1301, "error.1301", HttpStatus.BAD_REQUEST),
    OTP_INVALID(1302, "error.1302", HttpStatus.BAD_REQUEST),
    // Lỗi File (14xx)
    FILE_CANNOT_STORED(1401, "error.1401", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(1402, "error.1402", HttpStatus.NOT_FOUND),
    INVALID_IMAGE_TYPE(1403, "error.1403", HttpStatus.BAD_REQUEST),
    EXCEL_IMPORT_ERROR(1404, "error.1404", HttpStatus.INTERNAL_SERVER_ERROR),
    EXCEL_EXPORT_ERROR(1405, "error.1405", HttpStatus.INTERNAL_SERVER_ERROR),
    // Lỗi vai trò (15xx)
    ROLE_NOT_FOUND(1501, "error.1501", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(1502, "error.1502", HttpStatus.CONFLICT),
    ROLE_IN_USE(1503, "error.1503", HttpStatus.CONFLICT),
    // Lỗi danh mục (16xx)
    CATEGORY_NOT_FOUND(1601, "error.1601", HttpStatus.NOT_FOUND),
    CATEGORY_EXISTED(1602, "error.1602", HttpStatus.CONFLICT),
    // Lỗi sản phẩm (17xx)
    PRODUCT_NOT_FOUND(1701, "error.1701", HttpStatus.NOT_FOUND),
    PRODUCT_EXISTED(1702, "error.1702", HttpStatus.CONFLICT),
    // Lỗi địa chỉ (18xx)
    PROVINCE_NOT_FOUND(1801, "error.1801", HttpStatus.NOT_FOUND),
    WARD_NOT_FOUND(1802, "error.1802", HttpStatus.NOT_FOUND),
    ADDRESS_NOT_FOUND(1803, "error.1803", HttpStatus.NOT_FOUND),
    // Lỗi khác (99xx)
    UNCATEGORIZED_EXCEPTION(9999, "error.9999", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9998, "error.9998", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(9997, "error.9997", HttpStatus.CONFLICT),
    ;
    ErrorCode(int code, String messageKey, HttpStatusCode statusCode) {
        this.code = code;
        this.messageKey = messageKey;
        this.statusCode = statusCode;
    }
    public int getCode() {
        return code;
    }
    public String getMessageKey() {
        return messageKey;
    }
    public HttpStatusCode getStatusCode() {
        return statusCode;
    }

    private final int code;

    private final String messageKey;

    private final HttpStatusCode statusCode;
}
