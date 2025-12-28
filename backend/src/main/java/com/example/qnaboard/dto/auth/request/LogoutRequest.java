package com.example.qnaboard.dto.auth.request;

import lombok.Getter;

@Getter
public class LogoutRequest {
    private String refreshToken;
}