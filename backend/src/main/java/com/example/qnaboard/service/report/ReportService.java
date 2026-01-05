package com.example.qnaboard.service.report;

import com.example.qnaboard.config.ReportThresholdProperties;
import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.domain.comment.Comment;
import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.report.Report;
import com.example.qnaboard.domain.report.ReportTargetType;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.repository.answer.AnswerRepository;
import com.example.qnaboard.repository.comment.CommentRepository;
import com.example.qnaboard.repository.question.QuestionRepository;
import com.example.qnaboard.repository.report.ReportRepository;
import com.example.qnaboard.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CommentRepository commentRepository;

    private final ReportThresholdProperties threshold;

    /**
     * 신고 처리 (로그인 userId 문자열 기반)
     */
    @Transactional
    public ReportResult report(
            Long reporterUserPk,
            ReportTargetType targetType,
            Long targetId,
            String reason
    ) {
        // 1) 신고자 조회 (String userId -> User)
        User reporter = userRepository.findById(reporterUserPk)
                .orElseThrow(() -> new IllegalArgumentException("신고자 유저가 존재하지 않습니다."));

        // 2) 중복 신고 방지 (reporter PK로 체크)
        if (reportRepository.existsByReporter_IdAndTargetTypeAndTargetId(
                reporterUserPk, targetType, targetId)) {
            throw new IllegalStateException("이미 신고한 대상입니다.");
        }

        // 3) 신고 대상 존재 확인
        ensureTargetExists(targetType, targetId);

        // 4) 신고 저장
        reportRepository.save(new Report(reporter, targetType, targetId, reason));

        // 5) 누적 신고 수 확인
        long totalReports = reportRepository.countByTargetTypeAndTargetId(targetType, targetId);

        // 6) 임계치 도달 시 숨김 처리
        boolean hidden = false;
        if (totalReports >= thresholdFor(targetType)) {
            hidden = hideTarget(targetType, targetId);
        }

        return new ReportResult(true, totalReports, hidden);
    }

    /**
     * 신고 대상 존재 여부 확인
     */
    private void ensureTargetExists(ReportTargetType type, Long id) {
        switch (type) {
            case QUESTION -> {
                if (!questionRepository.existsById(id)) {
                    throw new IllegalArgumentException("신고 대상 질문이 존재하지 않습니다.");
                }
            }
            case ANSWER -> {
                if (!answerRepository.existsById(id)) {
                    throw new IllegalArgumentException("신고 대상 답변이 존재하지 않습니다.");
                }
            }
            case COMMENT -> {
                if (!commentRepository.existsById(id)) {
                    throw new IllegalArgumentException("신고 대상 댓글이 존재하지 않습니다.");
                }
            }
        }
    }

    /**
     * 대상 타입별 신고 임계치
     */
    private int thresholdFor(ReportTargetType type) {
        return switch (type) {
            case QUESTION -> threshold.getQuestion();
            case ANSWER -> threshold.getAnswer();
            case COMMENT -> threshold.getComment();
        };
    }

    /**
     * 신고 누적 시 대상 숨김 처리
     */
    private boolean hideTarget(ReportTargetType type, Long id) {
        switch (type) {
            case QUESTION -> {
                Question question = questionRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("질문이 존재하지 않습니다."));
                question.hide(); // Question에 isHidden + hide() 추가돼 있어야 함
                return true;
            }
            case ANSWER -> {
                Answer answer = answerRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("답변이 존재하지 않습니다."));
                answer.hide(); // Answer에 isHidden + hide() 추가돼 있어야 함
                return true;
            }
            case COMMENT -> {
                Comment comment = commentRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));
                comment.hide(); // Comment에 isHidden + hide() 추가돼 있어야 함
                return true;
            }
        }
        return false;
    }

    /**
     * 신고 결과 응답용 DTO
     */
    public record ReportResult(
            boolean reported,
            long totalReports,
            boolean hidden
    ) {}
}