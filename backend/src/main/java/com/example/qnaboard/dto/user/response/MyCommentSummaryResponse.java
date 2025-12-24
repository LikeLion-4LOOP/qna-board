package com.example.qnaboard.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyCommentSummaryResponse {
    private Long id;
    private String content;
    private String tag;
    private Long postId;
    private String createdAt;
}
