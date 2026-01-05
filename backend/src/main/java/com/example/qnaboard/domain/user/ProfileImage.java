package com.example.qnaboard.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "profile_images")
public class ProfileImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 유저와 1대1 관계를 맺게 해야 한다
    @OneToOne(fetch = FetchType.LAZY) // 한 명당 사진 하나
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long size;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public ProfileImage(User user, String originalName, String contentType, Long size, byte[] data) {
        this.user = user;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.data = data;
        this.createdAt = LocalDateTime.now();
    }
}