package com.cnweb20251.message_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    // Lỗi xác thực (11xx)
    UNAUTHORIZED(1101, "error.1101", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1102, "error.1102", HttpStatus.UNAUTHORIZED),

    // Lỗi người dùng (12xx)
    USER_NOT_FOUND(1201, "error.1201", HttpStatus.NOT_FOUND),
    USER_DISABLED(1202, "error.1202", HttpStatus.FORBIDDEN),

    // Lỗi File (13xx)
    FILE_CANNOT_STORED(1301, "error.1301", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(1302, "error.1302", HttpStatus.NOT_FOUND),
    INVALID_IMAGE_TYPE(1303, "error.1303", HttpStatus.BAD_REQUEST),
    // Lỗi vai trò (14xx)
    ROLE_NOT_FOUND(1401, "error.1401", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(1402, "error.1402", HttpStatus.CONFLICT),
    ROLE_IN_USE(1403, "error.1403", HttpStatus.CONFLICT),

    // Lỗi đơn hàng (19xx)

    // Lỗi khác (99xx)
    UNCATEGORIZED_EXCEPTION(9999, "error.9999", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9998, "error.9998", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION(9997, "error.9997", HttpStatus.CONFLICT),
    INVALID_REQUEST(9996, "error.9996", HttpStatus.BAD_REQUEST)
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
