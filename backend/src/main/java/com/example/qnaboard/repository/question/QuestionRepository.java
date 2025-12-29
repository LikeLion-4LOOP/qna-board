package com.example.qnaboard.repository.question;

import com.example.qnaboard.domain.question.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    Page<Question> findAll(Pageable pageable);
    //Page<Question> findByUserId(Long userId, Pageable pageable);
}