package com.cnweb20251.message_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

/**
 * MongoDB Configuration.
 * Cấu hình để xử lý map keys chứa dấu chấm (ví dụ: email như anhnta2004@gmail.com).
 */
@Configuration
public class MongoConfig {

    /**
     * Custom MappingMongoConverter để thay thế dấu chấm trong map keys.
     * MongoDB không cho phép dấu chấm (.) trong field names/map keys,
     * nên cần thay thế bằng ký tự khác (ở đây dùng _DOT_).
     */
    @Bean
    public MappingMongoConverter mappingMongoConverter(
            MongoDatabaseFactory mongoDatabaseFactory,
            MongoMappingContext mongoMappingContext) {
        
        DbRefResolver dbRefResolver = new DefaultDbRefResolver(mongoDatabaseFactory);
        MappingMongoConverter converter = new MappingMongoConverter(dbRefResolver, mongoMappingContext);
        
        // Thay thế dấu chấm (.) bằng _DOT_ trong map keys
        converter.setMapKeyDotReplacement("_DOT_");
        
        // Loại bỏ _class field trong documents (optional, giúp documents gọn hơn)
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        
        return converter;
    }
}
