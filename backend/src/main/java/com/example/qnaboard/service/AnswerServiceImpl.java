package com.example.qnaboard.service;

import com.example.qnaboard.dto.answer.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
public class AnswerServiceImpl implements AnswerService{
    @Override
    public AnswerResponseDto createAnswer(
            Long questionId,
            Long userId,
            AnswerCreateRequestDto requestDto
    ) {

        // 1. Question 조회
        // 2. User 조회
        // 3. Answer 생성
        // 4. 저장 후 DTO 반환
        return null;
    }

    @Override
    public AnswerResponseDto updateAnswer(
            Long answerId,
            Long userId,
            AnswerUpdateRequestDto requestDto
    ) {

        // 1. Answer 조회
        // 2. 작성자 검증
        // 3. 내용 수정
        return null;
    }

    @Override
    public void deleteAnswer(Long answerId, Long userId) {

        // 1. Answer 조회
        // 2. 작성자 검증
        // 3. 채택 여부 확인
        // 4. 삭제
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnswerResponseDto> getAnswersByQuestion(Long questionId) {

        // 1. 질문별 답변 조회
        // 2. DTO 변환
        return List.of();
    }

    @Override
    public void selectAnswer(Long answerId, Long userId) {

        // 1. 질문 작성자 검증
        // 2. 기존 채택 해제
        // 3. 답변 채택
    }

    @Override
    public void voteAnswer(Long answerId, Long userId) {

        // 1. 로그인 여부 확인
        // 2. 중복 추천 방지
        // 3. 추천 수 증가
    }
}
