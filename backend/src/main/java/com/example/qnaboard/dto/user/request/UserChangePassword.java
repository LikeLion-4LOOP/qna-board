package com.example.qnaboard.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UserChangePassword {
    @NotBlank
    String currentPw;
    @NotBlank
    String changePw;
}
