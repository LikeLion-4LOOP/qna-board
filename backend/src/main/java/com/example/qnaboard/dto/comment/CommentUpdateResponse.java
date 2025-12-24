package com.example.qnaboard.dto.comment;

import java.time.LocalDateTime;

//댓글수정 dto
public record CommentUpdateResponse(

        Long commentId,
        String content,
        LocalDateTime updatedAt
) {
}
