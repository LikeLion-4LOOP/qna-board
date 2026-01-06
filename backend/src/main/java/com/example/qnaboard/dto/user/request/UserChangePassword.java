package com.example.qnaboard.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class UserChangePassword {
    @NotBlank
    String currentPw;
    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
            message ="비밀번호는 8자 이상이며 문자와 숫자를 포함해야 합니다.")
    String changePw;
}
