package com.example.qnaboard.dto.question.response;

public record QuestionDeleteResponse(
        String message
) {
    public static QuestionDeleteResponse success() {
        return new QuestionDeleteResponse("게시글이 성공적으로 삭제되었습니다.");
    }
}