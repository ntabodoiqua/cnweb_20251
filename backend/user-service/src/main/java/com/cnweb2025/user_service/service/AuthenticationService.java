package com.cnweb2025.user_service.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.cnweb2025.user_service.dto.request.auth.AuthenticationRequest;
import com.cnweb2025.user_service.dto.request.auth.IntrospectRequest;
import com.cnweb2025.user_service.dto.request.auth.LogoutRequest;
import com.cnweb2025.user_service.dto.request.auth.RefreshRequest;
import com.cnweb2025.user_service.dto.response.AuthenticationResponse;
import com.cnweb2025.user_service.dto.response.IntrospectResponse;
import com.cnweb2025.user_service.entity.InvalidatedToken;
import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.repository.InvalidatedTokenRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationService {
    final UserRepository userRepository;
    final InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;
    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;
    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    // Service để xác thực token
    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        log.info("Introspecting token: {}", token);
        boolean isValid = true;
        try {
            var signedJWT = verifyToken(token, false);
            // Nếu token hợp lệ, trả về thông tin của người dùng
            String username = signedJWT.getJWTClaimsSet().getSubject();

            // Kiểm tra xem người dùng có bị vô hiệu hóa không
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            if (!user.isEnabled()) {
                isValid = false;
            }
        } catch (AppException e) {
            isValid = false;
        }
        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    // Xác thực chữ ký JWT
    SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        // Tùy vào cờ refresh, tính thời gian hết hạn khác nhau
        // Nếu là refresh token, thời gian hết hạn sẽ là thời gian phát hành cộng với REFRESHABLE_DURATION
        // Nếu là access token, thời gian hết hạn sẽ là thời gian hết hạn đã được đặt trong JWT
        Date expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);
        // Kiểm tra xem token có hợp lệ không
        if (!verified || expiryTime.before(new Date()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        // Kiểm tra xem token có bị thu hồi không
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        return signedJWT;
    }

    // Service xác thực người dùng và tạo JWT cho họ
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        // lấy người dùng từ cơ sở dữ liệu
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra xem người dùng có bị vô hiệu hóa không
        if (!user.isEnabled()) {
            throw new AppException(ErrorCode.USER_DISABLED);
        }
        
        // Kiểm tra xem người dùng đã xác thực email chưa
        if (!user.isVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        
        // Kiểm tra mật khẩu
        boolean authenticated = passwordEncoder.matches(
                request.getPassword(), user.getPassword());
        if (!authenticated) {
            log.warn("Authentication failed for user: {}", request.getUsername());
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    // Hàm tạo token
    String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("VDT2025")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create JWT for user: {}", user.getUsername(), e);
            throw new RuntimeException(e);
        }
    }

    // Hàm xây dựng scope cho người dùng
    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> stringJoiner.add("ROLE_" + role.getName()));
        return stringJoiner.toString();
    }

    // Hàm xử lý đăng xuất người dùng
    public void logout(LogoutRequest request) throws JOSEException, ParseException {
        try {
            // Nếu token còn trong thời gian hiệu lực, thêm vào danh sách token đã thu hồi
            var signToken = verifyToken(request.getToken(), true);
            // Lấy ra jwtId từ token và ngày hết hạn
            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryDate = signToken.getJWTClaimsSet().getExpirationTime();
            // Lưu vào cơ sở dữ liệu
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jit)
                    .expiryDate(expiryDate)
                    .build();
            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException e) {
            // Nếu token không hợp lệ, không cần làm gì cả
            log.warn("Token is not valid for logout: {}", request.getToken());
        }
    }

    // Hàm làm mới token
    public AuthenticationResponse refreshToken(RefreshRequest request) throws JOSEException, ParseException {
        var signJWT = verifyToken(request.getToken(), true);

        // Nếu token hợp lệ, tạo một token mới
        var jit = signJWT.getJWTClaimsSet().getJWTID();
        var expiryDate = signJWT.getJWTClaimsSet().getExpirationTime();
        // Lưu jwt cũ vào cơ sở dữ liệu để thu hồi sau này
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryDate(expiryDate)
                .build();
        invalidatedTokenRepository.save(invalidatedToken);
        // Tạo token mới
        var username = signJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Kiểm tra xem người dùng có bị vô hiệu hóa không
        if (!user.isEnabled()) {
            throw new AppException(ErrorCode.USER_DISABLED);
        }
        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }
}
