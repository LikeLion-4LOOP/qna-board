package com.example.qnaboard.dto.auth.request;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String userId;
    private String password;
    private String deviceId;
}
