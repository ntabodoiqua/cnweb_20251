package com.vdt2025.product_service.exception;

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
    // Lỗi File (13xx)
    FILE_CANNOT_STORED(1301, "error.1301", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NOT_FOUND(1302, "error.1302", HttpStatus.NOT_FOUND),
    INVALID_IMAGE_TYPE(1303, "error.1303", HttpStatus.BAD_REQUEST),
    // Lỗi vai trò (14xx)
    ROLE_NOT_FOUND(1401, "error.1401", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(1402, "error.1402", HttpStatus.CONFLICT),
    ROLE_IN_USE(1403, "error.1403", HttpStatus.CONFLICT),

    // Lỗi danh mục (150x)
    CATEGORY_NOT_FOUND(1501, "error.1501", HttpStatus.NOT_FOUND),
    CATEGORY_EXISTED(1502, "error.1502", HttpStatus.CONFLICT),
    CATEGORY_NAME_NOT_BLANK(1503, "error.1503", HttpStatus.BAD_REQUEST),
    CATEGORY_ALREADY_EXISTS(1504, "error.1504", HttpStatus.CONFLICT),
    PARENT_CATEGORY_NOT_FOUND(1505, "error.1505", HttpStatus.NOT_FOUND),
    INVALID_PARENT_CATEGORY(1506, "error.1506", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_PRODUCTS(1507, "error.1507", HttpStatus.CONFLICT),
    CATEGORY_HAS_SUBCATEGORIES(1508, "error.1508", HttpStatus.CONFLICT),
    CATEGORY_ALREADY_EXISTS_IN_STORE(1509, "error.1509", HttpStatus.CONFLICT),
    UNAUTHORIZED_ACCESS(1510, "error.1510", HttpStatus.FORBIDDEN),
    INVALID_CATEGORY_FOR_PRODUCT(1511, "error.1511", HttpStatus.BAD_REQUEST),
    STORE_CATEGORY_NOT_FOUND(1512, "error.1512", HttpStatus.NOT_FOUND),

    // Lỗi brand (152x)
    BRAND_NAME_REQUIRED(1520, "error.1520", HttpStatus.BAD_REQUEST),
    BRAND_EXISTED(1521, "error.1521", HttpStatus.CONFLICT),
    BRAND_NOT_FOUND(1522, "error.1522", HttpStatus.NOT_FOUND),

    // Lỗi sản phẩm (16xx)
    PRODUCT_NOT_FOUND(1601, "error.1601", HttpStatus.NOT_FOUND),
    PRODUCT_EXISTED(1602, "error.1602", HttpStatus.CONFLICT),
    PRODUCT_NAME_REQUIRED(1603, "error.1603", HttpStatus.BAD_REQUEST),
    PRODUCT_IMAGE_NAME_REQUIRED(1604, "error.1604", HttpStatus.BAD_REQUEST),
    PRODUCT_DESCRIPTION_REQUIRED(1605, "error.1605", HttpStatus.BAD_REQUEST),
    PRODUCT_NAME_INVALID_LENGTH(1606, "error.1606", HttpStatus.BAD_REQUEST),
    PRODUCT_DESCRIPTION_INVALID_LENGTH(1607, "error.1607", HttpStatus.BAD_REQUEST),
    SHORT_DESCRIPTION_TOO_LONG(1608, "error.1608", HttpStatus.BAD_REQUEST),
    CATEGORY_ID_REQUIRED(1609, "error.1609", HttpStatus.BAD_REQUEST),
    STORE_ID_REQUIRED(1610, "error.1610", HttpStatus.BAD_REQUEST),
    WEIGHT_MUST_BE_POSITIVE(1611, "error.1611", HttpStatus.BAD_REQUEST),
    PRICE_MUST_BE_POSITIVE(1612, "error.1612", HttpStatus.BAD_REQUEST),
    STOCK_QUANTITY_MUST_BE_POSITIVE(1613, "error.1613", HttpStatus.BAD_REQUEST),
    SKU_REQUIRED(1614, "error.1614", HttpStatus.BAD_REQUEST),
    SKU_ALREADY_EXISTS(1615, "error.1615", HttpStatus.CONFLICT),
    PRICE_REQUIRED(1616, "error.1616", HttpStatus.BAD_REQUEST),
    STOCK_QUANTITY_REQUIRED(1617, "error.1617", HttpStatus.BAD_REQUEST),
    VARIANT_NOT_FOUND(1618, "error.1618", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(1619, "error.1619", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_ACTIVE(1620, "error.1620", HttpStatus.BAD_REQUEST),
    VARIANT_NOT_ACTIVE(1621, "error.1621", HttpStatus.BAD_REQUEST),
    PRODUCT_IDS_REQUIRED(1624, "error.1624", HttpStatus.BAD_REQUEST),
    STATUS_REQUIRED(1625, "error.1625", HttpStatus.BAD_REQUEST),
    MAX_IMAGE_FOR_PRODUCT_REACHED(1626, "error.1626", HttpStatus.BAD_REQUEST),
    DUPLICATE_IMAGE_DISPLAY_ORDER(1627, "error.1627", HttpStatus.BAD_REQUEST),
    PRODUCT_IMAGE_NOT_FOUND(1628, "error.1628", HttpStatus.NOT_FOUND),
    PRODUCT_IMAGE_NOT_BELONG_TO_PRODUCT(1629, "error.1629", HttpStatus.BAD_REQUEST),
    PRODUCT_ID_REQUIRED(1630, "error.1630", HttpStatus.BAD_REQUEST),
    VARIANT_IDS_REQUIRED(1631, "error.1631", HttpStatus.BAD_REQUEST),
    CANNOT_ACTIVATE_VARIANT_OF_INACTIVE_PRODUCT(1632, "error.1632", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_PRODUCT_WITH_VARIANTS(1633, "error.1633", HttpStatus.BAD_REQUEST),

    // Lỗi store (17xx)
    STORE_NOT_FOUND(1701, "error.1701", HttpStatus.NOT_FOUND),
    STORE_ALREADY_EXISTS(1702, "error.1702", HttpStatus.CONFLICT),
    SELLER_PROFILE_PROCESSING_FAILED(1703, "error.1703", HttpStatus.INTERNAL_SERVER_ERROR),
    STORE_FETCH_FAILED(1704, "error.1704", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_MEDIA_TYPE(1705, "error.1705", HttpStatus.BAD_REQUEST),
    STORE_MEDIA_UPDATE_FAILED(1706, "error.1706", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED_STORE_ACCESS(1707, "error.1707", HttpStatus.FORBIDDEN),

    // Lỗi thuộc tính (18xx)
    ATTRIBUTE_NAME_REQUIRED(1801, "error.1801", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_CATEGORY_REQUIRED(1802, "error.1802", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_EXISTS(1803, "error.1803", HttpStatus.CONFLICT),
    ATTRIBUTE_NOT_FOUND(1804, "error.1804", HttpStatus.NOT_FOUND),
    ATTRIBUTE_VALUE_EXISTS(1805, "error.1805", HttpStatus.CONFLICT),
    ATTRIBUTE_VALUE_NOT_FOUND(1806, "error.1806", HttpStatus.NOT_FOUND),
    INVALID_CATEGORY_TYPE(1807, "error.1807", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_NOT_APPLICABLE_TO_PRODUCT_CATEGORY(1808, "error.1808", HttpStatus.BAD_REQUEST),

    // Lỗi tồn kho (19xx)
    INVENTORY_STOCK_NOT_FOUND(1901, "error.1901", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK(1902, "error.1902", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK_FOR_RESERVED(1903, "error.1903", HttpStatus.BAD_REQUEST),
    INVALID_INVENTORY_STATE(1904, "error.1904", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_INVENTORY_OPERATION(1905, "error.1905", HttpStatus.BAD_REQUEST),
    INVALID_STOCK_QUANTITY(1906, "error.1906", HttpStatus.BAD_REQUEST),
    INVENTORY_STOCK_ALREADY_EXISTS(1907, "error.1907", HttpStatus.CONFLICT),


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
