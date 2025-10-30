package com.cnweb.inventory_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    // Lỗi xác thực (11xx)
    UNAUTHORIZED(1101, "error.1101", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1102, "error.1102", HttpStatus.UNAUTHORIZED),

    // Lỗi inventory (18xx)
    INVENTORY_NOT_FOUND(1801, "error.1801", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(1802, "error.1802", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY(1803, "error.1803", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_IN_INVENTORY(1804, "error.1804", HttpStatus.NOT_FOUND),
    INVENTORY_ALREADY_EXISTS(1805, "error.1805", HttpStatus.CONFLICT),
    CANNOT_RESERVE_INVENTORY(1806, "error.1806", HttpStatus.BAD_REQUEST),
    CANNOT_RELEASE_INVENTORY(1807, "error.1807", HttpStatus.BAD_REQUEST),
    RESERVATION_NOT_FOUND(1808, "error.1808", HttpStatus.NOT_FOUND),
    RESERVATION_EXPIRED(1809, "error.1809", HttpStatus.BAD_REQUEST),
    
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
