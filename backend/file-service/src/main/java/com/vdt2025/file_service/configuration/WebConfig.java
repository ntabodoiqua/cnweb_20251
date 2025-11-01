package com.vdt2025.file_service.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.util.UrlPathHelper;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    // UserStatusInterceptor đã bị loại bỏ - logic kiểm tra user được chuyển vào Service layer

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Chỉ map URL /uploads/public/** tới thư mục uploads/public/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");

        // Không map /uploads/private/** để buộc phải qua controller với authentication
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        UrlPathHelper urlPathHelper = new UrlPathHelper();
        urlPathHelper.setAlwaysUseFullPath(true);
        urlPathHelper.setUrlDecode(true);
        configurer.setUrlPathHelper(urlPathHelper);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173/") // Địa chỉ frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    // Không cần interceptor nữa vì logic đã được chuyển vào Service layer
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(userStatusInterceptor)
//                .addPathPatterns("/**")
//                .excludePathPatterns(
//                        "/auth/token",
//                        "/auth/introspect",
//                        "/auth/logout",
//                        "/auth/refresh",
//                        "/users",
//                        "/category/get-categories",
//                        "/category",
//                        "/uploads/**",
//                        "/files/download/**",
//                        "/swagger-ui/**",
//                        "/v3/api-docs/**",
//                        "/swagger-ui.html"
//                );
//    }


}
