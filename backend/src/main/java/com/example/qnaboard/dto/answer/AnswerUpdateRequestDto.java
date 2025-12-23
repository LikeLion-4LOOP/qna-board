package com.example.qnaboard.dto.answer;


import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnswerUpdateRequestDto {
    private String content;

    // 수정 검증 로직 추가
}
