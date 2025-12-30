package com.example.qnaboard.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyQuestionSummaryResponse {
    private Long id;
    private String title;
    private String createdAt;
}
