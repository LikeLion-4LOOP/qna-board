package com.example.qnaboard.exception;
import com.example.qnaboard.exception.common.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum QuestionErrorCode implements ErrorCode {

    QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_404", "질문을 찾을 수 없습니다."),
    UNAUTHORIZED_USER(HttpStatus.FORBIDDEN, "QUESTION_403", "작성자만 수정/삭제할 수 있습니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "QUESTION_400", "잘못된 입력입니다."),
    // ===== 이미지 관련 (추가) =====
    LOGIN_REQUIRED(HttpStatus.UNAUTHORIZED, "AUTH_401", "로그인이 필요합니다."),
    QUESTION_FORBIDDEN(HttpStatus.FORBIDDEN, "QUESTION_403_1", "질문 작성자만 이미지 업로드가 가능합니다."),

    IMAGE_EMPTY(HttpStatus.BAD_REQUEST, "QUESTION_IMG_400", "이미지 파일이 비어 있습니다."),
    INVALID_IMAGE_TYPE(HttpStatus.BAD_REQUEST, "QUESTION_IMG_400_1", "이미지 파일만 업로드할 수 있습니다."),
    IMAGE_TOO_LARGE(HttpStatus.BAD_REQUEST, "QUESTION_IMG_400_2", "이미지 파일 용량이 너무 큽니다."),
    IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_IMG_404", "이미지를 찾을 수 없습니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;

    QuestionErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}