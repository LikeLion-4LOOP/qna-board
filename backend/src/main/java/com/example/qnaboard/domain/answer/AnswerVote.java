package com.example.qnaboard.domain.answer;

import com.example.qnaboard.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "answer_vote",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_answer_vote_answer_user",
                columnNames = {"answer_id", "user_id"}
        )
)
public class AnswerVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 답변을
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "answer_id", nullable = false)
    private Answer answer;

    // 누가 추천했는지
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime createdAt;

    public AnswerVote(Answer answer, User user) {
        this.answer = answer;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }
}
