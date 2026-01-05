package com.example.qnaboard.domain.point;

import com.example.qnaboard.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "point_transactions")
public class PointTransaction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PointType type;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private int balanceSnapShot;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PointTransaction(User user, PointType type, int amount, int balanceSnapShot) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.balanceSnapShot = balanceSnapShot;
    }


    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}