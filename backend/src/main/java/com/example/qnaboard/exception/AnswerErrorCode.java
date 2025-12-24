package com.example.qnaboard.exception;


import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AnswerErrorCode implements ErrorCode {

    ANSWER_CONTENT_EMPTY(HttpStatus.BAD_REQUEST, "ANSWER_400", "답변 내용은 비어 있을 수 없습니다."),
    ANSWER_NOT_FOUND(HttpStatus.NOT_FOUND, "ANSWER_404", "답변을 찾을 수 없습니다."),

    ANSWER_FORBIDDEN(HttpStatus.FORBIDDEN, "ANSWER_403", "작성자만 수행할 수 있습니다."),
    LOGIN_REQUIRED(HttpStatus.UNAUTHORIZED, "AUTH_401", "로그인이 필요합니다."),

    ANSWER_SELECTED_CANNOT_DELETE(HttpStatus.CONFLICT, "ANSWER_409", "채택된 답변은 삭제할 수 없습니다. 채택 해제 후 삭제하세요."),
    ANSWER_CANNOT_SELECT_NO_QUESTION(HttpStatus.CONFLICT, "ANSWER_409_1", "questionId가 없어 채택할 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    AnswerErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}