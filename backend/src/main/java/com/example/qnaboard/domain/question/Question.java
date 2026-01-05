package com.example.qnaboard.domain.question;

import com.example.qnaboard.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionCategory category;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private int viewCount = 0;

    @Column(nullable = false)
    private boolean isHidden = false;

    public void hide() {
        this.isHidden = true;
    }

    // 정렬용 필드
    @Column(nullable = false)
    private int answerCount = 0; // 답변 개수
    
    public void updateAnswerCount(int count) {
        this.answerCount = count;
    }
    
    public void incrementAnswerCount() {
        this.answerCount++;
    }
    
    public void decrementAnswerCount() {
        if (this.answerCount > 0) {
            this.answerCount--;
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public Question(String title, String content, User user, QuestionCategory category) {
        this.title = title;
        this.content = content;
        this.user = user;
        this.category = category;
        this.viewCount = 0;
        this.answerCount = 0;
    }

    public void addViewCount() {
        this.viewCount++;
    }

    public void update(String title, String content,QuestionCategory category) {
        this.title = title;
        this.content = content;
        this.category = category;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    public void increaseViewCount() {
        this.viewCount++;
    }
}