package com.example.qnaboard.dto.comment;

import java.time.LocalDateTime;

//댓글작성 dto
public record CommentCreateResponse(

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