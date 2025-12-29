package com.example.qnaboard.service.auth;

import com.example.qnaboard.domain.auth.RefreshToken;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.auth.response.TokenResponse;
import com.example.qnaboard.exception.AuthErrorCode;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.auth.RefreshTokenRepository;
import com.example.qnaboard.repository.user.UserRepository;
import com.example.qnaboard.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    /**
     * 로그인
     * - username/password 검증
     * - access/refresh 발급
     * - refresh는 DB 저장
     */
    @Transactional
    public TokenResponse login(String username, String password, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            throw new BusinessException(AuthErrorCode.NOT_DEVICE_ID);
        }

        // 유저 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        //비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(UserErrorCode.WRONG_PASSWORD);
        }

        //토큰 발급
        String access = jwtProvider.createAccessToken(user.getId());
        String refresh = jwtProvider.createRefreshToken(user.getId());

        //refresh 저장
        refreshTokenRepository.save(new RefreshToken(
                refresh,
                user,
                deviceId,
                jwtProvider.getExpiry(refresh)
        ));

        return new TokenResponse(access, refresh);
    }

    /**
     * Access 재발급(Refresh)
     * - refresh 토큰 검증
     * - DB에 저장된 토큰인지 확인
     * - revoked/만료 확인
     * - 기존 refresh revoke + 새 refresh 저장
     */
    @Transactional
    public TokenResponse refresh(String refreshToken, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            throw new BusinessException(AuthErrorCode.NOT_DEVICE_ID);
        }

        // refresh 유효성 확인
        if (!jwtProvider.validate(refreshToken) || !"refresh".equals(jwtProvider.getType(refreshToken))) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        // DB에서 refresh 조회
        RefreshToken saved = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BusinessException(AuthErrorCode.NOT_MATCH_REFRESH_TOKEN));

        // 기기 일치 확인
        if (!saved.getDeviceId().equals(deviceId)) {
            throw new BusinessException(AuthErrorCode.NOT_MATCH_DEVICE);
        }

        // 폐기/만료 확인
        if (saved.isRevoked() || saved.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(AuthErrorCode.EXPIRED_TOKEN);
        }

        User user = saved.getUser();

        // 기존 refresh 폐기
        saved.revoke();

        // 새 토큰 발급
        String newAccess = jwtProvider.createAccessToken(user.getId());
        String newRefresh = jwtProvider.createRefreshToken(user.getId());

        // 새 refresh 저장
        refreshTokenRepository.save(new RefreshToken(
                newRefresh,
                user,
                deviceId,
                jwtProvider.getExpiry(newRefresh)
        ));

        return new TokenResponse(newAccess, newRefresh);
    }

    /**
     * 로그아웃
     * - refresh 토큰 유효성 확인
     * - refresh 토큰 조회 후 revoke = true 로 변경
     */
    @Transactional
    public void logout(String refreshToken) {
        // refresh 유효성 확인
        if (!jwtProvider.validate(refreshToken) || !"refresh".equals(jwtProvider.getType(refreshToken))) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        // DB에서 refresh 조회 후 rekove = true로 변경
        refreshTokenRepository.findByToken(refreshToken).orElseThrow(() -> new BusinessException(AuthErrorCode.INVALID_TOKEN)).revoke();
    }
}
