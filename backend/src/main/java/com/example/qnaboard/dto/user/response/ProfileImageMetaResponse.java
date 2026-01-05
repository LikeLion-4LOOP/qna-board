package com.example.qnaboard.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 현재 어떤 파일이 등록되어있는지
@Getter
@AllArgsConstructor
public class ProfileImageMetaResponse {
    private Long id;
    private String originalName;
    private String contentType;
    private Long size;
}