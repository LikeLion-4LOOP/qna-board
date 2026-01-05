package com.example.qnaboard.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "users")
public class User {
    public User(String userId, String encodedPassword ,String username) {
        this.userId = userId;
        this.username = username;
        this.password = encodedPassword;
        this.point = 0;
        this.level = Level.BRONZE;
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true, length = 50)
    private String userId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private int point;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateUsername(String username) {
        this.username = username;
    }
    public void addPoint(int num){
        this.point+=num;
        this.level = Level.fromPoint(this.point);
    }
    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
