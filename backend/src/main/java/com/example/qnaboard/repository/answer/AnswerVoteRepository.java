package com.example.qnaboard.repository.answer;

import com.example.qnaboard.domain.answer.AnswerVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnswerVoteRepository extends JpaRepository<AnswerVote, Long> {

    // 이미 추천했는지 중복 체크
    boolean existsByAnswer_IdAndUser_Id(Long answerId, Long userId);

    // 추천 취소(토글)까지 할 거면 필요
    Optional<AnswerVote> findByAnswer_IdAndUser_Id(Long answerId, Long userId);


}