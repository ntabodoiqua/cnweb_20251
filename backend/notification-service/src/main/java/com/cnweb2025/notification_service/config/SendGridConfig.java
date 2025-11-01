package com.cnweb2025.notification_service.config;

import com.sendgrid.SendGrid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class SendGridConfig {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Bean
    public SendGrid sendGrid() {
        log.info("Initializing SendGrid client...");
        return new SendGrid(sendGridApiKey);
    }

    public String getFromEmail() {
        return fromEmail;
    }
}
