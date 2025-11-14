package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleOAuthService {

    @NonFinal
    @Value("${google.client.id}")
    String clientId;

    /**
     * Verify Google ID token and extract payload
     *
     * @param idTokenString Google ID token from frontend
     * @return GoogleIdToken.Payload containing user information
     */
    public GoogleIdToken.Payload verifyToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                // Log user info for debugging
                log.info("Google token verified successfully for email: {}", payload.getEmail());

                return payload;
            } else {
                log.error("Invalid Google ID token");
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }
        } catch (Exception e) {
            log.error("Error verifying Google token: {}", e.getMessage());
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
    }
}
