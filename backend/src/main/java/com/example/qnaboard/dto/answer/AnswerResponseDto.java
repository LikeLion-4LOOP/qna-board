package com.example.qnaboard.dto.answer;


import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AnswerResponseDto {
    private Long id;
    private String content;
    private Long userId;
    private int vote;
    private boolean isSelect;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Entity → DTO 변환 메서드 추가
}
// 필요한 정보만 클라이언트에 전달