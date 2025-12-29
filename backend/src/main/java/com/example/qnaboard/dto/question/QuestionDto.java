package com.example.qnaboard.dto.question;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDto {

    private Long id;
    private String title;
    private String content;
    private String writer;
    private LocalDateTime createTime;
}