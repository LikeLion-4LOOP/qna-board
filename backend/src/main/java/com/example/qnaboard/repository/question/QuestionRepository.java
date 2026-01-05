package com.example.qnaboard.repository.question;

import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.question.QuestionCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface QuestionRepository extends JpaRepository<Question, Long> {

    // ===== 기본 조회 =====
    Page<Question> findAllByIsHiddenFalse(Pageable pageable);

    Optional<Question> findByIdAndIsHiddenFalse(Long id);

    Page<Question> findByUser_IdAndIsHiddenFalse(Long userId, Pageable pageable);

    // 신고(관리자용: 숨김 목록 조회)
    Page<Question> findAllByIsHiddenTrue(Pageable pageable);

    /**
     * 검색 + 카테고리 + 숨김 제외 조회
     * - isHidden = false
     * - category 가 null이면 전체
     * - keyword 가 null/blank면 키워드 조건 생략
     */
    @Query("""
        select q
        from Question q
        where q.isHidden = false
          and (:category is null or q.category = :category)
          and (
                :keyword is null or :keyword = ''
                or q.title like concat('%', :keyword, '%')
                or q.content like concat('%', :keyword, '%')
          )
        """)
    Page<Question> searchVisible(
            @Param("keyword") String keyword,
            @Param("category") QuestionCategory category,
            Pageable pageable
    );
}