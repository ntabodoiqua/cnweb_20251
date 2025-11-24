package com.vdt2025.product_service.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

@Configuration
public class FeignClientInterceptor {

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate requestTemplate) {
                // Lấy context của request hiện tại
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    // Lấy header "Authorization" từ request gốc
                    String authorizationHeader = attributes.getRequest().getHeader("Authorization");

                    // Nếu có header, thêm nó vào request của Feign
                    if (Objects.nonNull(authorizationHeader)) {
                        requestTemplate.header("Authorization", authorizationHeader);
                    }
                }

                // Thêm internal service header cho tất cả các Feign requests
                // để các services khác biết đây là internal service-to-service call
                requestTemplate.header("X-Internal-Request", internalServiceSecret);
            }
        };
    }
}
