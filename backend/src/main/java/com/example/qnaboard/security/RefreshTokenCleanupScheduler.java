package com.example.qnaboard.security;

import com.example.qnaboard.repository.auth.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    // 매일 새벽 4시(서버 시간 기준)
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void deleteExpiredRefreshTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deleted = refreshTokenRepository.deleteAllExpired(now);
        log.info("[RefreshTokenCleanup] deleted={}, now={}", deleted, now);
    }
}

