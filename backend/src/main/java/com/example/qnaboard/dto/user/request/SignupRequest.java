package com.example.qnaboard.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SignupRequest {
    @NotBlank
    private String userId;
    @NotBlank
    private String password;
    @NotBlank
    private String username;
}

