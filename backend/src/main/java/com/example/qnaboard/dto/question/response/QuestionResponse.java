package com.example.qnaboard.dto.question.response;

import java.time.LocalDateTime;

public record QuestionResponse(
        Long id,
        String title,
        String content,
        LocalDateTime createdAt,
        UserResponse user
) {
    public record UserResponse(
            Long id,
            String username
    ) {}
}