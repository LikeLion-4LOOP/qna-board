package com.example.qnaboard.dto.comment.response;


import java.time.LocalDateTime;

public class CommentResponse {
    private Long commentId;
    private String content;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse() {
    }
}
