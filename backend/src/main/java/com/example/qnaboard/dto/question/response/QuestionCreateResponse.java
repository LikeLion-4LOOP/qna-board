package com.example.qnaboard.dto.question.response;

import java.time.LocalDateTime;

public record QuestionCreateResponse(
        Long id,
        String title,
        String username,
        int viewCount,
        LocalDateTime createdAt
) {}
