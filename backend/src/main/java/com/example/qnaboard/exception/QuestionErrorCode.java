package com.example.qnaboard.exception;
import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

public enum QuestionErrorCode  {
    QUESTION_NOT_FOUND(404, "질문을 찾을 수 없습니다."),
    UNAUTHORIZED_USER(403, "작성자만 수정/삭제할 수 있습니다."),
    INVALID_INPUT(400, "잘못된 입력입니다.");

import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum QuestionErrorCode implements ErrorCode {

    QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_404", "질문을 찾을 수 없습니다."),
    UNAUTHORIZED_USER(HttpStatus.FORBIDDEN, "QUESTION_403", "작성자만 수정/삭제할 수 있습니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "QUESTION_400", "잘못된 입력입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    QuestionErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}