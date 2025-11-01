package com.vdt2025.file_service.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

/**
 * DTO để trả về thông tin file từ S3
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class S3FileInfo {
    String key;           // Tên file
    Long size;            // Kích thước (bytes)
    Date lastModified;    // Thời gian sửa đổi cuối
    String url;           // URL để truy cập file
    String etag;          // ETag của file
}
