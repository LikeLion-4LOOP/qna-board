package com.example.qnaboard.repository.answer;

import com.example.qnaboard.domain.answer.Answer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AnswerRepository extends JpaRepository<Answer, Long> {
    // userId 기반 페이징 조회
    Page<Answer> findByUserId(Long userId, Pageable pageable);
    Page<Answer> findByQuestionId(Long questionId, Pageable pageable);
    //id중복확인
    Optional<Answer> findByQuestionIdAndIsSelectTrue(Long questionId);
}