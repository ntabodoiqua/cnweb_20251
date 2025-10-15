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
    String directory;
}
