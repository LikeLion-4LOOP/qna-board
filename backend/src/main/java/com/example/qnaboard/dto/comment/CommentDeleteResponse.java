package com.example.qnaboard.dto.comment;

//댓글삭제 dto
public record CommentDeleteResponse(

        String message
) {
    public static CommentDeleteResponse success() {
        return new CommentDeleteResponse("댓글이 삭제되었습니다");
    }
}