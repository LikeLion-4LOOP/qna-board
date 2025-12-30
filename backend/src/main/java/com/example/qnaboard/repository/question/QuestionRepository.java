package com.example.qnaboard.repository.question;

import com.example.qnaboard.domain.question.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    // 작성 질문 목록 조회
    Page<Question> findByUser_Id(
            Long userId,
            Pageable pageable
    );

//    // 제목내 키워드 포함된 질문 검색 - 추가적인 기능
//    Page<Question> findByTitleContaining(
//            String keyword,
//            Pageable pageable
//    );
//
//    // 특정 유저가 작성한 글 중 제목으로 검색
//    Page<Question> findByUser_IdAndTitleContaining(
//            Long userId,
//            String keyword,
//            Pageable pageable
//    );
}