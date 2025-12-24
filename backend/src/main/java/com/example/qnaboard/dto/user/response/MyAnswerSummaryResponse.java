package com.example.qnaboard.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyAnswerSummaryResponse {
    private Long id;
    private Long questionId;
    private String content;
    private int vote;
    private boolean isSelected;
    private String createdAt;
}
