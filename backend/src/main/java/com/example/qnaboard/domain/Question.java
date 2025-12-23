package com.example.qnaboard.domain;

@Entity
@Getter
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String username;

    @Builder
    public Question(String title, String content, String username) {
        this.title = title;
        this.content = content;
        this.username = username;
    }
    // 질문 수정
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }
}
