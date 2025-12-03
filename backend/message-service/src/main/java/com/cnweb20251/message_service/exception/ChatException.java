package com.cnweb20251.message_service.exception;

/**
 * Exception cho các lỗi liên quan đến chat.
 */
public class ChatException extends RuntimeException {

    private int code;

    public ChatException(String message) {
        super(message);
        this.code = 1001;
    }

    public ChatException(int code, String message) {
        super(message);
        this.code = code;
    }

    public ChatException(String message, Throwable cause) {
        super(message, cause);
        this.code = 1001;
    }

    public int getCode() {
        return code;
    }
}
