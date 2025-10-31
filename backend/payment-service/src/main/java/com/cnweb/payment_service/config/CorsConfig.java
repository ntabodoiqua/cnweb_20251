package com.cnweb.payment_service.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS configuration has been centralized at API Gateway level.
 * This configuration is no longer needed as all requests go through the Gateway.
 * Keep this file for reference but disable the CORS filter bean.
 */
@Configuration
public class CorsConfig {

    // CORS được cấu hình tập trung tại API Gateway
    // Không cần CorsFilter ở đây nữa
    
//    @Bean
//    public CorsFilter corsFilter() {
//        CorsConfiguration corsConfiguration = new CorsConfiguration();
//        
//        // Allow all origins in development, specify exact domains in production
//        corsConfiguration.setAllowedOrigins(Arrays.asList("*"));
//        corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
//        corsConfiguration.setAllowCredentials(false);
//        corsConfiguration.setMaxAge(3600L);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", corsConfiguration);
//
//        return new CorsFilter(source);
//    }
}
