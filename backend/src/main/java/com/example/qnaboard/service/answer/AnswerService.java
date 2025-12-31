package com.example.qnaboard.service.answer;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.dto.answer.AnswerCreateRequest;
import com.example.qnaboard.dto.answer.AnswerResponseDto;
import com.example.qnaboard.dto.answer.AnswerUpdateRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

public interface AnswerService {
    // 답변 작성
    AnswerResponseDto createAnswer(Long questionId, Long userId, AnswerCreateRequest requestDto);
    /* service레벨에서 책임*/

    // 답변 수정
    AnswerResponseDto updateAnswer(Long answerId, Long userId, AnswerUpdateRequestDto requestDto);
    /* service레벨에서 책임*/

    // 답변 삭제
    void deleteAnswer(Long answerId, Long userId);

    // 답변 목록 조회
    Page<AnswerResponseDto> getAnswersByQuestion(Long questionId, Pageable pageable);

    // 답변 채택
    void selectAnswer(Long answerId, Long userId);

    // 답변 추천
    void voteAnswer(Long answerId, Long userId);
    // 조회수 증가
    AnswerResponseDto getAnswerDetail(Long answerId);

    // pageable
    Page<AnswerResponseDto> getAnswersByUser(Long userId, Pageable pageable);
}
