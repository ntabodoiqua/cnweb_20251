package com.vdt2025.product_service.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] AUTH_ENDPOINTS = {
            "/auth/**"
    };

    private static final String[] SWAGGER_ENDPOINTS = {
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**"
    };

    private static final String[] HEALTH_ENDPOINTS = {
        "/actuator/health",
        "/actuator/health/**",
        "/actuator/info",
        "/actuator/info/**"
}; 

    private static final String[] PUBLIC_POST_ENDPOINTS = {
            "/users",
            "/public/**"
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/products/public/**",
            "/categories/public/**",
            "/brands/public/**",
            "/public/**"
    };

    CustomJwtDecoder customJwtDecoder;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(request ->
                        request
                                // Allow Swagger endpoints (highest priority)
                                .requestMatchers(SWAGGER_ENDPOINTS).permitAll()
                                .requestMatchers(HEALTH_ENDPOINTS).permitAll()
                                // Allow auth endpoints
                                .requestMatchers(AUTH_ENDPOINTS).permitAll()
                                // Allow POST to create users
                                .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
                                // Allow GET requests to public endpoints
                                .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                                // All other requests need authentication
                                .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwtConfigurer ->
                                        jwtConfigurer.decoder(customJwtDecoder)
                                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
