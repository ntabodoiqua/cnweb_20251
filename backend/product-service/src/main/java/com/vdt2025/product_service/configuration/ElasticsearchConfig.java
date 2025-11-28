package com.vdt2025.product_service.configuration;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.util.StringUtils;

import java.util.concurrent.Executor;

/**
 * Elasticsearch Configuration
 * Được tối ưu cho server 8GB RAM
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "com.vdt2025.product_service.repository.elasticsearch")
@EnableAsync
@EnableScheduling
@Slf4j
public class ElasticsearchConfig {

    @Value("${spring.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUris;

    @Value("${spring.elasticsearch.username:}")
    private String username;

    @Value("${spring.elasticsearch.password:}")
    private String password;

    @Value("${spring.elasticsearch.connection-timeout:5s}")
    private String connectionTimeout;

    @Value("${spring.elasticsearch.socket-timeout:30s}")
    private String socketTimeout;

    @Bean
    public RestClient restClient() {
        // Parse URI
        String uri = elasticsearchUris.replace("http://", "").replace("https://", "");
        String[] parts = uri.split(":");
        String host = parts[0];
        int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 9200;
        String scheme = elasticsearchUris.startsWith("https") ? "https" : "http";

        RestClientBuilder builder = RestClient.builder(new HttpHost(host, port, scheme));

        // Configure timeouts
        builder.setRequestConfigCallback(requestConfigBuilder ->
                requestConfigBuilder
                        .setConnectTimeout(parseTimeout(connectionTimeout))
                        .setSocketTimeout(parseTimeout(socketTimeout))
        );

        // Configure authentication if provided
        if (StringUtils.hasText(username) && StringUtils.hasText(password)) {
            CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(
                    AuthScope.ANY,
                    new UsernamePasswordCredentials(username, password)
            );

            builder.setHttpClientConfigCallback(httpClientBuilder ->
                    httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider)
            );
        }

        // Configure connection pool for limited memory
        builder.setHttpClientConfigCallback(httpClientBuilder ->
                httpClientBuilder
                        .setMaxConnTotal(20)  // Giới hạn connections
                        .setMaxConnPerRoute(10)
        );

        log.info("Elasticsearch RestClient configured for: {}:{}", host, port);
        return builder.build();
    }

    @Bean
    public ElasticsearchTransport elasticsearchTransport(RestClient restClient) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        
        return new RestClientTransport(
                restClient,
                new JacksonJsonpMapper(objectMapper)
        );
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(ElasticsearchTransport transport) {
        return new ElasticsearchClient(transport);
    }

    @Bean(name = {"elasticsearchTemplate", "elasticsearchOperations"})
    public ElasticsearchOperations elasticsearchOperations(ElasticsearchClient elasticsearchClient) {
        return new ElasticsearchTemplate(elasticsearchClient);
    }

    /**
     * Thread pool cho async Elasticsearch operations
     * Giới hạn threads để tiết kiệm memory
     */
    @Bean(name = "elasticsearchTaskExecutor")
    public Executor elasticsearchTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);           // Ít core threads
        executor.setMaxPoolSize(4);            // Max 4 threads
        executor.setQueueCapacity(100);        // Queue để buffer requests
        executor.setThreadNamePrefix("es-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        
        log.info("Elasticsearch async executor configured with core=2, max=4");
        return executor;
    }

    private int parseTimeout(String timeout) {
        if (timeout == null || timeout.isEmpty()) {
            return 5000;
        }
        // Parse "5s" -> 5000, "30s" -> 30000
        String value = timeout.replaceAll("[^0-9]", "");
        int seconds = Integer.parseInt(value);
        if (timeout.endsWith("s")) {
            return seconds * 1000;
        }
        return seconds;
    }
}
