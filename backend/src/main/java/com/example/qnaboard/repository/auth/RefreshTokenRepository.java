package com.example.qnaboard.repository.auth;

import com.example.qnaboard.domain.auth.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByUser_IdAndRevokedFalse(Long userId);
    @Modifying
    @Query("delete from RefreshToken rt where rt.expiresAt < :now")
    int deleteAllExpired(@Param("now") LocalDateTime now);
    List<RefreshToken> findAllByUser_IdAndDeviceIdAndRevokedFalse(Long userId, String deviceId);
}
