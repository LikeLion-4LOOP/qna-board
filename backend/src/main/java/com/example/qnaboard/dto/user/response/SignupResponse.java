package com.example.qnaboard.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {
    private Long id;
    private String userId;
    private String username;
}
