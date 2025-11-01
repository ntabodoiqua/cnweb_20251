package com.vdt2025.file_service.service;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "file")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileStorageProperties {
    S3Properties s3;
    
    @Getter
    @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class S3Properties {
        String endpoint;
        String region;
        String bucketName;
        String accessKey;
        String secretKey;
    }
}
