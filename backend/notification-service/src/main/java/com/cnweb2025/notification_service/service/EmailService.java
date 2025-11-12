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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    public void sendWelcomeEmailWithoutOtp(String to) {
        final String subject = "Chào mừng đến với HUSTBuy!";
        Context context = new Context();
        context.setVariable("subject", subject);

        String htmlContent = templateEngine.process("welcome-email-no-otp", context);

        sendEmail(to, subject, htmlContent);
        log.info("Welcome email without OTP sent to {}", to);
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

    public void sendSellerProfileRejectedEmail(String to, String storeName, String reason, String sellerProfileId, LocalDateTime rejectedAt) {
        final String subject = "Hồ sơ người bán của bạn đã bị từ chối - HUSTBuy";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm");
        String formattedRejectedAt = rejectedAt.format(formatter);

        Context context = new Context();
        context.setVariable("storeName", storeName);
        context.setVariable("rejectionReason", reason);
        context.setVariable("contactEmail", to);
        context.setVariable("sellerProfileId", sellerProfileId);
        context.setVariable("rejectedAt", formattedRejectedAt);
        context.setVariable("subject", subject);

        String htmlContent = templateEngine.process("seller-profile-rejected-email", context);

        sendEmail(to, subject, htmlContent);
        log.info("Seller profile rejected email sent to {}", to);
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

    public void sendUserDisableEmail(String to, String username) {
        final String subject = "Tài khoản của bạn đã bị vô hiệu hóa - HUSTBuy";
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("subject", subject);
        String htmlContent = templateEngine.process("user-disable-email", context);
        sendEmail(to, subject, htmlContent);
        log.info("User disable email sent to {}", to);
    }

    public void sendPaymentSuccessEmail(String to, String title, String description, 
                                       String transactionId, Long amount, LocalDateTime paidAt) {
        final String subject = "Thanh toán thành công - HUSTBuy";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm");
        String formattedPaidAt = paidAt != null ? paidAt.format(formatter) : "N/A";
        
        // Format amount to Vietnamese currency (VND)
        String formattedAmount = String.format("%,d VNĐ", amount);
        
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("title", title);
        context.setVariable("description", description);
        context.setVariable("transactionId", transactionId);
        context.setVariable("amount", formattedAmount);
        context.setVariable("paidAt", formattedPaidAt);
        
        String htmlContent = templateEngine.process("payment-success-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Payment success email sent to {} for transaction: {}", to, transactionId);
    }

    public void sendPaymentFailedEmail(String to, String title, String description,
                                      String transactionId, Long amount, String failureReason,
                                      LocalDateTime failedAt) {
        final String subject = "Thanh toán thất bại - HUSTBuy";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm");
        String formattedFailedAt = failedAt != null ? failedAt.format(formatter) : "N/A";
        
        // Format amount to Vietnamese currency (VND)
        String formattedAmount = String.format("%,d VNĐ", amount);
        
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("title", title);
        context.setVariable("description", description);
        context.setVariable("transactionId", transactionId);
        context.setVariable("amount", formattedAmount);
        context.setVariable("failureReason", failureReason);
        context.setVariable("failedAt", formattedFailedAt);
        
        String htmlContent = templateEngine.process("payment-failed-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Payment failed email sent to {} for transaction: {}", to, transactionId);
    }

    public void sendRefundSuccessEmail(String to, String title, String refundId, String transactionId, 
                                      Long amount, Long refundFee, String refundReason, 
                                      LocalDateTime refundedAt) {
        final String subject = "Hoàn tiền thành công - HUSTBuy";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm");
        String formattedRefundedAt = refundedAt != null ? refundedAt.format(formatter) : "N/A";
        
        // Format amount to Vietnamese currency (VND)
        String formattedAmount = String.format("%,d VNĐ", amount);
        String formattedRefundFee = refundFee != null ? String.format("%,d VNĐ", refundFee) : null;
        
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("title", title);
        context.setVariable("refundId", refundId);
        context.setVariable("transactionId", transactionId);
        context.setVariable("amount", formattedAmount);
        context.setVariable("refundFee", formattedRefundFee);
        context.setVariable("refundReason", refundReason);
        context.setVariable("refundedAt", formattedRefundedAt);
        
        String htmlContent = templateEngine.process("refund-success-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Refund success email sent to {} for refund: {}", to, refundId);
    }

    public void sendRefundFailedEmail(String to, String title, String refundId, String transactionId,
                                     Long amount, String refundReason, String failureReason,
                                     LocalDateTime failedAt) {
        final String subject = "Hoàn tiền thất bại - HUSTBuy";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm");
        String formattedFailedAt = failedAt != null ? failedAt.format(formatter) : "N/A";
        
        // Format amount to Vietnamese currency (VND)
        String formattedAmount = String.format("%,d VNĐ", amount);
        
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("title", title);
        context.setVariable("refundId", refundId);
        context.setVariable("transactionId", transactionId);
        context.setVariable("amount", formattedAmount);
        context.setVariable("refundReason", refundReason);
        context.setVariable("failureReason", failureReason);
        context.setVariable("failedAt", formattedFailedAt);
        
        String htmlContent = templateEngine.process("refund-failed-email", context);
        
        sendEmail(to, subject, htmlContent);
        log.info("Refund failed email sent to {} for refund: {}", to, refundId);
    }
}
