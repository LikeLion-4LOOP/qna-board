package com.example.qnaboard.repository.answer;

import com.example.qnaboard.domain.answer.Answer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AnswerRepository extends JpaRepository<Answer, Long> {
    // userId 기반 페이징 조회
    // 채택 답변 우선 + 최신순
    Page<Answer> findByQuestion_IdOrderByIsSelectDescCreatedAtDesc(
            Long questionId, Pageable pageable
    );

    Optional<Answer> findByQuestion_IdAndIsSelectTrue(Long questionId);

    Page<Answer> findByUser_Id(Long userId, Pageable pageable);

    // 질문별 답변 수 조회
    int countByQuestion_Id(Long questionId);

    Page<Answer> findAllByIsHiddenTrue(Pageable pageable);

    Page<Answer> findByQuestion_IdAndIsHiddenFalseOrderByIsSelectDescCreatedAtDesc(Long questionId, Pageable pageable);

    Optional<Answer> findByQuestion_IdAndIsSelectTrueAndIsHiddenFalse(Long questionId);

    Page<Answer> findByUser_IdAndIsHiddenFalse(Long userId, Pageable pageable);

    int countByQuestion_IdAndIsHiddenFalse(Long questionId);
}