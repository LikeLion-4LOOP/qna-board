public enum ErrorCode {
    QUESTION_NOT_FOUND(404, "질문을 찾을 수 없습니다."),
    UNAUTHORIZED_USER(403, "작성자만 수정/삭제할 수 있습니다."),
    INVALID_INPUT(400, "잘못된 입력입니다.");

    private final int status;
    private final String message;

    ErrorCode(int status, String message) {
        this.status = status;
        this.message = message;
    }
    public int getStatus() { return status; }
    public String getMessage() { return message; }
}