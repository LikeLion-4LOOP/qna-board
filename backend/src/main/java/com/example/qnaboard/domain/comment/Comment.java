package com.example.qnaboard.domain.comment;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name="comments")
public class Comment {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length=1000)
    private String content;

    //@ManyToOne(fetch = FetchType.LAZY, optional = false)
    //@JoinColumn(name="user_id")
    //private User user;
    @Column(nullable = false)
    private Long userId;

    @Column(nullable=false)
    private boolean isQuestion;

    @Column(nullable=false)
    private Long postId;

    @Column(nullable=false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public Comment(String content, Long userId, boolean isQuestion, Long postId) {
        this.content = content;
        this.userId = userId;
        this.isQuestion = isQuestion;
        this.postId = postId;
    }

    public void updateContent(String content) {
        this.content = content;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}