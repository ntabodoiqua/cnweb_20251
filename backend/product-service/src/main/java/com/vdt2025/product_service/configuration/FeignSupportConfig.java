package com.vdt2025.product_service.configuration;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class FeignSupportConfig {

    private final ObjectFactory<HttpMessageConverters> messageConverters;

    public FeignSupportConfig(ObjectFactory<HttpMessageConverters> messageConverters) {
        this.messageConverters = messageConverters;
    }

    /**
     * Encoder hỗ trợ cả multipart/form-data và JSON.
     * SpringFormEncoder sẽ delegate sang SpringEncoder cho các request không phải multipart.
     */
    @Bean
    @Primary
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder(new SpringEncoder(messageConverters));
    }
}