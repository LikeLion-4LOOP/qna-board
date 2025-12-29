package com.example.qnaboard.exception;

import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AuthErrorCode implements ErrorCode {

    UNAUTHORIZED(
            HttpStatus.UNAUTHORIZED,
            "AUTH_401",
            "로그인이 필요합니다."
    ),

    FORBIDDEN(
            HttpStatus.FORBIDDEN,
            "AUTH_403",
            "접근 권한이 없습니다."
    ),

    INVALID_TOKEN(
            HttpStatus.UNAUTHORIZED,
            "AUTH_401_1",
            "유효하지 않은 토큰입니다."
    ),

    EXPIRED_TOKEN(
            HttpStatus.UNAUTHORIZED,
            "AUTH_401_2",
            "만료된 토큰입니다."
    ),
    NOT_DEVICE_ID(
            HttpStatus.UNAUTHORIZED,
            "AUTH_401_3",
            "디바이스 ID가 존재하지 않습니다"
    ),
    NOT_MATCH_DEVICE(
            HttpStatus.UNAUTHORIZED,
            "AUTH_401_4",
            "디바이스가 일치하지 않습니다"
    ),
    NOT_MATCH_REFRESH_TOKEN(
            HttpStatus.UNAUTHORIZED,
            "AUTH_401_5",
            "존재하지 않는 refreshToken입니다."
    );

    private final HttpStatus status;
    private final String code;
    private final String message;

    AuthErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}