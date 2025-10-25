package com.cnweb2025.notification_service.service;

import com.cnweb2025.notification_service.config.SendGridConfig;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {
    SendGrid sendGrid;
    SendGridConfig sendGridConfig;
    TemplateEngine templateEngine;

    /**
     * Helper method to send email using SendGrid API
     */
    private void sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            Email from = new Email(sendGridConfig.getFromEmail());
            Email to = new Email(toEmail);
            Content content = new Content("text/html", htmlContent);
            Mail mail = new Mail(from, subject, to, content);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent successfully to {}. Status code: {}", toEmail, response.getStatusCode());
            } else {
                log.warn("Email sent with non-2xx status code to {}. Status: {}, Body: {}", 
                    toEmail, response.getStatusCode(), response.getBody());
            }
        } catch (IOException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email via SendGrid", e);
        }
    }

    public void sendWelcomeEmail(String to, String username, String otpCode) {
        final String subject = "Chào mừng đến với HUSTBuy - Xác thực email của bạn!";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        context.setVariable("otpCode", otpCode);

        String htmlContent = templateEngine.process("welcome-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Welcome email with OTP sent to {}", to);
    }

    public void sendVerificationEmail(String to, String username, String otpCode) {
        final String subject = "Xác thực email của bạn - HUSTBuy";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        context.setVariable("otpCode", otpCode);

        String htmlContent = templateEngine.process("verification-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Verification email with OTP sent to {}", to);
    }

    public void sendPasswordResetEmail(String to, String username, String otpCode) {
        final String subject = "Đặt lại mật khẩu - HUSTBuy";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        context.setVariable("otpCode", otpCode);

        String htmlContent = templateEngine.process("password-reset-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Password reset email with OTP sent to {}", to);
    }

    public void sendErrorEmailToAdmin(String errorMessage) {
        final String adminEmail = "anhnta2004@gmail.com";
        final String subject = "Lỗi trong dịch vụ thông báo NTA VDT_2025";
        
        String textContent = "Đã xảy ra lỗi trong dịch vụ thông báo NTA VDT_2025:\n\n" +
                errorMessage + "\n\n" +
                "Vui lòng kiểm tra và xử lý kịp thời.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ NTA VDT_2025";
        
        // Convert plain text to simple HTML
        String htmlContent = "<html><body><pre>" + textContent + "</pre></body></html>";
        
        sendEmail(adminEmail, subject, htmlContent);
        log.info("Error email sent to admin");
    }

    public void sendStoreCreatedEmail(String to, String storeName) {
        final String subject = "Chúc mừng! Cửa hàng của bạn đã được tạo thành công - HUSTBuy";
        Context context = new Context();
        context.setVariable("storeName", storeName);
        context.setVariable("subject", subject);

        String htmlContent = templateEngine.process("store-created-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Store created email sent to {}", to);
    }
}
