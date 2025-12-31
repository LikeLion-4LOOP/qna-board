package com.example.qnaboard.dto.question.request;

import com.example.qnaboard.domain.question.QuestionCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200, message = "제목은 200자를 넘을 수 없습니다.")
        String title,

        @NotBlank(message = "내용을 입력해주세요.")
        String content,

        @NotNull(message = "카테고리는 필수입니다.")
        QuestionCategory category
) {}