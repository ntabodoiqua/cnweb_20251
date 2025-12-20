package com.vdt2025.api_gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global Filter để chặn mọi request từ client có chứa header X-Internal-Request
 * Header này chỉ được dùng cho service-to-service communication
 * Bất kỳ client nào cố gắng gửi header này sẽ bị từ chối
 */
@Component
@Slf4j
public class InternalHeaderBlockingFilter implements GlobalFilter, Ordered {

    private static final String INTERNAL_HEADER = "X-Internal-Request";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Kiểm tra xem request từ client có chứa internal header không
        if (exchange.getRequest().getHeaders().containsKey(INTERNAL_HEADER)) {
            log.warn("Blocked request with internal header from IP: {} to path: {}",
                    exchange.getRequest().getRemoteAddress(),
                    exchange.getRequest().getPath());

            // Từ chối request
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            String errorResponse = "{\"code\":1105,\"message\":\"Use of internal service headers is forbidden\"}";
            return exchange.getResponse().writeWith(
                    Mono.just(exchange.getResponse().bufferFactory().wrap(errorResponse.getBytes()))
            );
        }

        // Cho phép request tiếp tục nếu không có internal header
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // Chạy filter này đầu tiên (trước tất cả các filter khác)
        return Ordered.HIGHEST_PRECEDENCE;
    }
}