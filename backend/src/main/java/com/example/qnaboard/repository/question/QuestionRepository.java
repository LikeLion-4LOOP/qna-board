package com.example.qnaboard.repository.question;

import com.example.qnaboard.domain.question.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    // 작성 질문 목록 조회
    Page<Question> findByUser_Id(
            Long userId,
            Pageable pageable
    );

    // 제목 내 키워드 포함된 질문 검색
    Page<Question> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);

    //신고
    Optional<Question> findByIdAndIsHiddenFalse(Long id);

    Page<Question> findAllByIsHiddenFalse(Pageable pageable);

    Page<Question> findByUser_IdAndIsHiddenFalse(Long userId, Pageable pageable);

    Page<Question> findByIsHiddenFalseAndTitleContainingOrIsHiddenFalseAndContentContaining(String title, String content, Pageable pageable);


}