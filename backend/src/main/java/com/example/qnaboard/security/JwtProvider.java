package com.example.qnaboard.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey key;
    private final long accessExpMs;
    private final long refreshExpMs;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-exp-ms:900000}") long accessExpMs,
            @Value("${jwt.refresh-exp-ms:1209600000}") long refreshExpMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpMs = accessExpMs;
        this.refreshExpMs = refreshExpMs;
    }

    /**
     * AccessToken 발급
     * - typ=access
     */

    public String createAccessToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("typ", "access")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpMs))
                .signWith(key)
                .compact();
    }

    /**
     * RefreshToken 발급
     * - typ=refresh
     */
    public String createRefreshToken(Long userId) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("typ", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(refreshExpMs)))
                .signWith(key)
                .compact();
    }

    /**
     * 토큰 검증
     * - 서명/만료/형식 오류가 있으면 false
     */
    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 클레임 파싱 (검증 포함)
     *
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key) // 서명 검증 키
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** subject에 넣어둔 userId 추출 */
    public Long getUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    /** typ(access/refresh) 추출 */
    public String getType(String token) {
        Object typ = parseClaims(token).get("typ");
        return typ == null ? null : typ.toString();
    }

    /** 만료시각을 LocalDateTime으로 변환 */
    public LocalDateTime getExpiry(String token) {
        Date exp = parseClaims(token).getExpiration();
        return LocalDateTime.ofInstant(exp.toInstant(), ZoneId.systemDefault());
    }
}
