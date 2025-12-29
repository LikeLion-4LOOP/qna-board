package com.example.qnaboard.exception;

import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum CommentErrorCode implements ErrorCode {
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND,"COMMENT_404","댓글을 찾을 수 없습니다."),
    COMMENT_FORBIDDEN(HttpStatus.FORBIDDEN,"COMMENT_403","댓글에 대한 권한이 없습니다.");
    private final HttpStatus status;
    private final String code;
    private final String message;

    CommentErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
