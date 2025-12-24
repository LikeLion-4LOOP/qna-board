package com.example.qnaboard.dto.comment.response;

import java.time.LocalDateTime;

//댓글목록조회 dto ->post.id를 기준으로 목록조회
public record CommentResponse(

        Long commentId,
        Long postId,
        Boolean isQuestion,
        String content,
        LocalDateTime createdAt,
        UserResponse user
) {
    public record UserResponse(
            Long id
    ) {}
}