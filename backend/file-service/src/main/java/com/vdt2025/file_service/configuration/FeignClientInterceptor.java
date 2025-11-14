package com.vdt2025.file_service.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignClientInterceptor {

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate requestTemplate) {
                // Thêm internal service header cho tất cả các Feign requests
                // Giao tiếp giữa các services chỉ xác thực bằng X-Internal-Request header
                requestTemplate.header("X-Internal-Request", internalServiceSecret);
            }
        };
    }
}
