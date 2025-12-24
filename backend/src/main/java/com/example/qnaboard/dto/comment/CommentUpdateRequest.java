package com.example.qnaboard.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

//댓글 수정 dto
public record CommentUpdateRequest(

        @NotBlank(message = "댓글 내용은 비어 있을 수 없습니다.")
        @Size(max = 1000, message = "댓글은 최대 1000자까지 가능합니다.")
        String content
) {
}
