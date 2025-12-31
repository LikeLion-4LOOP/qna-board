package com.example.qnaboard.dto.answer;


import com.example.qnaboard.domain.answer.Answer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;


import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class AnswerResponseDto {
    private Long id;
    private Long questionId;
    private String content;
    private Long userId;
    private int vote;
    private boolean isSelect;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    // Entity → DTO 변환 메서드 추가
    public static AnswerResponseDto from(Answer answer) {
        return AnswerResponseDto.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion().getId())
                .userId(answer.getUser().getId())
                .content(answer.getContent())
                .viewCount(answer.getViewCount())
                .vote(answer.getVote())
                .isSelect(answer.isSelect())
                .createdAt(answer.getCreatedAt())
                .updatedAt(answer.getUpdatedAt())
                .build();
    }
}
// 필요한 정보만 클라이언트에 전달