package com.example.qnaboard.domain.auth;

import com.example.qnaboard.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, length = 100)
    private String deviceId;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    public RefreshToken(String token, User user, String deviceId,
                        LocalDateTime expiresAt) {
        this.token = token;
        this.user = user;
        this.deviceId = deviceId;
        this.expiresAt = expiresAt;
        this.revoked = false;
    }


    public void revoke() {
        this.revoked = true;
    }

    public boolean isExpired(LocalDateTime now) {
        return this.expiresAt.isBefore(now);
    }
}
