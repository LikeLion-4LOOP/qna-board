package com.example.qnaboard.dto.question.request;

import jakarta.validation.constraints.NotBlank;

import com.example.qnaboard.domain.question.QuestionCategory;
import jakarta.validation.constraints.NotNull;

public record QuestionUpdateRequest(
        @NotBlank(message = "제목은 비어있을 수 없습니다.")
        String title,

        @NotBlank(message = "내용은 비어있을 수 없습니다.")
        String content,

        @NotNull(message = "카테고리는 필수입니다.")
        QuestionCategory category
) {}