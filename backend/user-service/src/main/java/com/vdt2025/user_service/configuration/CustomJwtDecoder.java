package com.vdt2025.user_service.configuration;

import com.nimbusds.jose.JOSEException;
import com.vdt2025.user_service.dto.request.auth.IntrospectRequest;
import com.vdt2025.user_service.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    private AuthenticationService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) {
        try {
            // dùng service introspect xem token còn hiệu lực không
            var response = authenticationService.introspect(IntrospectRequest.builder()
                    .token(token).build());
            if (!response.isValid()) {
                throw new JwtException("Token invalid");
            }
        } catch (JOSEException | ParseException e) {
            // nếu hết hiệu lực
            throw new JwtException(e.getMessage());
        }
        // Nếu còn hiệu lực
        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder
                    .withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();

        }
        return nimbusJwtDecoder.decode(token);
    }
}
