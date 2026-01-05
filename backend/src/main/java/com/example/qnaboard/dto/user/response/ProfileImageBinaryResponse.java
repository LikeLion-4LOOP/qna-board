package com.example.qnaboard.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileImageBinaryResponse {
    private String originalName;
    private String contentType;
    private byte[] data;
}