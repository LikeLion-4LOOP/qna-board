package com.example.qnaboard.repository;

import com.example.qnaboard.domain.answer.Answer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AnswerRepository extends JpaRepository<Answer, Long> {
    // userId 기반 페이징 조회
    Page<Answer> findByUserId(Long userId, Pageable pageable);
}