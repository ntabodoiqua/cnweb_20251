package com.cnweb.order_service.config;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder; // Import class này
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignSupportConfig {

    // Inject ObjectFactory<HttpMessageConverters> để lấy encoder JSON mặc định của Spring
    @Bean
    public Encoder multipartFormEncoder(ObjectFactory<HttpMessageConverters> messageConverters) {
        // Tạo một SpringEncoder (xử lý JSON)
        Encoder defaultEncoder = new SpringEncoder(messageConverters);

        // Bọc nó vào trong SpringFormEncoder
        // Logic: Nếu là Form/File -> dùng SpringFormEncoder. Nếu không -> dùng defaultEncoder (JSON)
        return new SpringFormEncoder(defaultEncoder);
    }
}