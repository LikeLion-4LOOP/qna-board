package com.example.qnaboard.dto.comment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

//댓글작성 dto
public record CommentCreateRequest(

        @NotBlank(message = "댓글 내용은 필수입니다.")
        @Size(max = 1000, message = "댓글은 최대 1000자까지 가능합니다.")
        String content
) {
}