package com.example.qnaboard.dto.question.response;

import java.time.LocalDateTime;

public record QuestionResponse(
        Long id,
        String title,
        String content,
        int viewCount,
        int answerCount,
        CategoryResponse category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UserResponse user
) {
    public record UserResponse(Long id, String username) {}
    public record CategoryResponse(
            String code,        // DEV_IT
            String displayName  // 개발/IT
    ) {}
}