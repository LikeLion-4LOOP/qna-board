package com.example.qnaboard.repository.answer;

import com.example.qnaboard.domain.answer.AnswerVote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerVoteRepository extends JpaRepository<AnswerVote, Long> {

    boolean existsByAnswer_IdAndUser_Id(Long answerId, Long userId);
}