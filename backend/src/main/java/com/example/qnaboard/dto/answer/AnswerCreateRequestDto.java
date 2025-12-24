package com.example.qnaboard.dto.answer;


import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnswerCreateRequestDto {
    private String content;

    // validation 추가
}
