package com.example.qnaboard.exception;

import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ProfileErrorCode implements ErrorCode {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "P000_404", "사용자를 찾을 수 없습니다."),
    PROFILE_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "프로필 이미지를 찾을 수 없습니다."),
    INVALID_IMAGE_TYPE(HttpStatus.BAD_REQUEST, "P002", "이미지 파일 형식만 업로드 가능합니다."),
    IMAGE_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "P003", "이미지 크기는 5MB를 초과할 수 없습니다."),
    IMAGE_EMPTY(HttpStatus.BAD_REQUEST, "P004", "업로드할 이미지 파일이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ProfileErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}