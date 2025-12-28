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
    INVALID_GOOGLE_TOKEN(1215, "error.1215", HttpStatus.UNAUTHORIZED),
    GOOGLE_TOKEN_REQUIRED(1216, "error.1216", HttpStatus.BAD_REQUEST),
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
    MISSING_RECEIVER_NAME(1804, "error.1804", HttpStatus.BAD_REQUEST),
    MISSING_RECEIVER_PHONE(1805, "error.1805", HttpStatus.BAD_REQUEST),
    MISSING_PROVINCE_ID(1806, "error.1806", HttpStatus.BAD_REQUEST),
    MISSING_WARD_ID(1807, "error.1807", HttpStatus.BAD_REQUEST),
    MISSING_STREET(1808, "error.1808", HttpStatus.BAD_REQUEST),
    WARD_PROVINCE_MISMATCH(1809, "error.1809", HttpStatus.BAD_REQUEST),
    ADDRESS_USER_MISMATCH(1810, "error.1810", HttpStatus.BAD_REQUEST),

    // Lỗi shop profile (19xx)
    MISSING_STORE_NAME(1901, "error.1901", HttpStatus.BAD_REQUEST),
    SELLER_PROFILE_ALREADY_EXISTS(1902, "error.1902", HttpStatus.CONFLICT),
    SELLER_PROFILE_NOT_FOUND(1903, "error.1903", HttpStatus.NOT_FOUND),
    SELLER_PROFILE_NOT_PENDING(1904, "error.1904", HttpStatus.BAD_REQUEST),
    SELLER_PROFILE_APPROVAL_FAILED(1905, "error.1905", HttpStatus.INTERNAL_SERVER_ERROR),
    SELLER_PROFILE_REJECTION_NOTIFICATION_FAILED(1906, "error.1906", HttpStatus.INTERNAL_SERVER_ERROR),
    MISSING_REJECTION_REASON(1907, "error.1907", HttpStatus.BAD_REQUEST),
    SELLER_PROFILE_NOT_EDITABLE(1908, "error.1908", HttpStatus.BAD_REQUEST),
    STORE_DEACTIVATION_FAILED(1909, "error.1909", HttpStatus.INTERNAL_SERVER_ERROR),
    SELLER_PROFILE_ALREADY_HAS_DOCUMENT(1910, "error.1910", HttpStatus.CONFLICT),
    SELLER_PROFILE_UPLOAD_DOCUMENT_FAILED(1911, "error.1911", HttpStatus.INTERNAL_SERVER_ERROR),
    SELLER_PROFILE_UPLOAD_DOCUMENT_EMPTY(1912, "error.1912", HttpStatus.BAD_REQUEST),
    SELLER_PROFILE_UPLOAD_DOCUMENT_INVALID_TYPE(1913, "error.1913", HttpStatus.BAD_REQUEST),
    SELLER_PROFILE_DOCUMENT_NOT_FOUND(1914, "error.1914", HttpStatus.NOT_FOUND),
    SELLER_PROFILE_GET_DOCUMENT_LINK_FAILED(1915, "error.1915", HttpStatus.INTERNAL_SERVER_ERROR),

    // Lỗi xóa tài khoản (20xx)
    USER_ALREADY_DELETED(2001, "error.2001", HttpStatus.BAD_REQUEST),
    USER_NOT_DELETED(2002, "error.2002", HttpStatus.BAD_REQUEST),
    USER_DELETION_REQUESTED(2003, "error.2003", HttpStatus.BAD_REQUEST),
    USER_DELETION_NOT_REQUESTED(2004, "error.2004", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_ADMIN(2005, "error.2005", HttpStatus.FORBIDDEN),
    USER_HAS_ACTIVE_ORDERS(2006, "error.2006", HttpStatus.CONFLICT),
    USER_HAS_ACTIVE_SELLER_PROFILE(2007, "error.2007", HttpStatus.CONFLICT),
    GRACE_PERIOD_NOT_EXPIRED(2008, "error.2008", HttpStatus.BAD_REQUEST),

    // Lỗi khác (99xx)
    UNCATEGORIZED_EXCEPTION(9999, "error.9999", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9998, "error.9998", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(9997, "error.9997", HttpStatus.CONFLICT),
    FILE_SIZE_EXCEEDED(9996, "error.9996", HttpStatus.BAD_REQUEST),
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
