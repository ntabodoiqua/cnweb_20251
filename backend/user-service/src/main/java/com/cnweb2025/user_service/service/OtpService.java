package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.entity.OtpCode;
import com.cnweb2025.user_service.enums.OtpType;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.repository.OtpCodeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OtpService {
    OtpCodeRepository otpCodeRepository;
    
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 5;
    private static final long OTP_EXPIRY_MILLISECONDS = OTP_EXPIRY_MINUTES * 60 * 1000;
    
    /**
     * Tạo mã OTP ngẫu nhiên gồm 6 chữ số
     */
    public String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
    
    /**
     * Tạo và lưu OTP code cho user
     */
    @Transactional
    public String createOtpCode(String userId, OtpType type) {
        log.info("Creating OTP code for user: {} with type: {}", userId, type);
        
        // Xóa OTP cũ nếu có
        otpCodeRepository.findByUserIdAndType(userId, type)
                .ifPresent(otpCodeRepository::delete);
        
        // Tạo OTP mới
        String otpCode = generateOtpCode();
        long expiryTime = System.currentTimeMillis() + OTP_EXPIRY_MILLISECONDS;
        
        OtpCode otp = OtpCode.builder()
                .userId(userId)
                .otpCode(otpCode)
                .expiryTime(expiryTime)
                .type(type)
                .build();
        
        otpCodeRepository.save(otp);
        log.info("OTP code created successfully for user: {}", userId);
        
        return otpCode;
    }
    
    /**
     * Xác thực OTP code
     */
    @Transactional
    public void verifyOtpCode(String userId, String otpCode, OtpType type) {
        log.info("Verifying OTP code for user: {} with type: {}", userId, type);
        
        long currentTime = System.currentTimeMillis();
        
        // Tìm OTP code hợp lệ (chưa hết hạn)
        OtpCode otp = otpCodeRepository.findByUserIdAndTypeAndExpiryTimeGreaterThan(userId, type, currentTime)
                .orElseThrow(() -> {
                    log.warn("OTP code expired or not found for user: {}", userId);
                    return new AppException(ErrorCode.OTP_EXPIRED);
                });
        
        // Kiểm tra OTP code có khớp không
        if (!otp.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP code for user: {}", userId);
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        
        // Xóa OTP sau khi xác thực thành công
        otpCodeRepository.delete(otp);
        log.info("OTP code verified successfully for user: {}", userId);
    }
    
    /**
     * Xóa các OTP đã hết hạn
     */
    @Transactional
    public void deleteExpiredOtpCodes() {
        long currentTime = System.currentTimeMillis();
        otpCodeRepository.deleteByExpiryTimeLessThan(currentTime);
        log.info("Deleted expired OTP codes");
    }
    
    /**
     * Kiểm tra xem user có OTP code hợp lệ không
     */
    public boolean hasValidOtp(String userId, OtpType type) {
        long currentTime = System.currentTimeMillis();
        return otpCodeRepository.findByUserIdAndTypeAndExpiryTimeGreaterThan(userId, type, currentTime)
                .isPresent();
    }
}
