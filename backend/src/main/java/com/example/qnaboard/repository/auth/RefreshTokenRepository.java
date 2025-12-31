package com.example.qnaboard.repository.auth;

import com.example.qnaboard.domain.auth.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByUser_IdAndRevokedFalse(Long userId);
    List<RefreshToken> findAllByUser_IdAndDeviceIdAndRevokedFalse(Long userId, String deviceId);
}
