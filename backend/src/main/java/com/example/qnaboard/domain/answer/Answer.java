package com.example.qnaboard.domain.answer;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 보안강화
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)// 자동증가
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // Answer N : 1 Question
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // Answer N : 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int vote;

    private boolean isSelect;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 생성자 / 비즈니스 메서드 추가
}
