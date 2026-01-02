package com.example.qnaboard.exception;

import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum UserErrorCode implements ErrorCode {

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_404", "사용자를 찾을 수 없습니다."),
    ID_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_409", "아이디가 이미 존재합니다."),
    WRONG_PASSWORD(HttpStatus.NOT_FOUND, "USER_404_2", "비밀번호가 일치하지 않습니다."),
    USERNAME_ALREADY_EXISTS(HttpStatus.CONFLICT,"USER_409","닉네임이 이미 존재합니다."),
    PASSWORD_POLICY_VIOLATION(HttpStatus.BAD_REQUEST, "USER_400", "비밀번호의 형식이 유효하지 않습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    UserErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}