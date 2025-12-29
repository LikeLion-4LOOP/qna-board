package com.example.qnaboard.dto.auth.request;

import lombok.Getter;

@Getter
public class RefreshRequest {
    private String refreshToken;
    private String deviceId;
}
