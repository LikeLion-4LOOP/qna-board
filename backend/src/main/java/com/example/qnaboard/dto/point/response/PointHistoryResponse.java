package com.example.qnaboard.dto.point.response;

import com.example.qnaboard.domain.point.PointType;

import java.time.LocalDateTime;

public record PointHistoryResponse(
        Long id,
        PointType type,
        int amount,
        int balanceAfter,
        LocalDateTime createdAt
) {}