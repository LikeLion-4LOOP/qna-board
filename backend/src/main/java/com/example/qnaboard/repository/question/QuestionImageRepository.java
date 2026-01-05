package com.example.qnaboard.repository.question;

import com.example.qnaboard.domain.question.QuestionImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionImageRepository extends JpaRepository<QuestionImage, Long> {
    List<QuestionImage> findByQuestion_Id(Long questionId);
}