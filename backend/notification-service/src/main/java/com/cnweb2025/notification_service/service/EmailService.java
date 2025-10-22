package com.cnweb2025.notification_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {
    JavaMailSender mailSender;
    TemplateEngine templateEngine; // Thêm TemplateEngine

    public void sendWelcomeEmail(String to, String username, String otpCode) {
        // Chuẩn bị các biến cho template
        final String subject = "Chào mừng đến với HUSTBuy - Xác thực email của bạn!";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        context.setVariable("otpCode", otpCode);

        // Render template HTML thành một chuỗi String
        String htmlContent = templateEngine.process("welcome-email", context);

        try {
            // Sử dụng MimeMessage và MimeMessageHelper để gửi email HTML
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true để chỉ định đây là nội dung HTML

            mailSender.send(mimeMessage);
            log.info("Welcome email with OTP sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendVerificationEmail(String to, String username, String otpCode) {
        final String subject = "Xác thực email của bạn - HUSTBuy";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        context.setVariable("otpCode", otpCode);

        String htmlContent = templateEngine.process("verification-email", context);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Verification email with OTP sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendPasswordResetEmail(String to, String username, String otpCode) {
        final String subject = "Đặt lại mật khẩu - HUSTBuy";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        context.setVariable("otpCode", otpCode);

        String htmlContent = templateEngine.process("password-reset-email", context);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Password reset email with OTP sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    public void sendErrorEmailToAdmin(String errorMessage) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("anhnta2004@gmail.com");
        message.setSubject("Lỗi trong dịch vụ thông báo NTA VDT_2025");
        message.setText("Đã xảy ra lỗi trong dịch vụ thông báo NTA VDT_2025:\n\n" +
                errorMessage + "\n\n" +
                "Vui lòng kiểm tra và xử lý kịp thời.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ NTA VDT_2025");
        try {
            mailSender.send(message);
            log.info("Error email sent to admin");
        } catch (Exception e) {
            log.error("Failed to send error email to admin: {}", e.getMessage());
            throw new RuntimeException("Failed to send error email to admin", e);
        }
    }
}
