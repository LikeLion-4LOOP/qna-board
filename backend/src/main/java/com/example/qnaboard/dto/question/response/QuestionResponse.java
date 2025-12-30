package com.example.qnaboard.dto.question.response;

import java.time.LocalDateTime;

public record QuestionResponse( //질문 상세조회
        Long id,
        String title,
        String content,
        String username,
        int viewCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}