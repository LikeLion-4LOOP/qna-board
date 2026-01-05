package com.example.qnaboard.domain.report;


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
        name = "reports",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_reporter_target",
                        columnNames = {"reporter_user_pk", "target_type", "target_id"}
                )
        }
)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고자
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_user_pk", nullable = false) // users.id
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReportTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;


    @Column(name = "reason", length = 50)
    private String reason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Report(User reporter, ReportTargetType targetType, Long targetId, String reason) {
        this.reporter = reporter;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
    }
}