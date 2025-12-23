package com.example.qnaboard.service;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.dto.answer.*;
import com.example.qnaboard.repository.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;

    @Override
    public AnswerResponseDto createAnswer(Long questionId, Long userId, AnswerCreateRequestDto requestDto) {
        // TODO: Question, User 조회 후 Answer 저장
        return null;
    }

    @Override
    public AnswerResponseDto updateAnswer(Long answerId, Long userId, AnswerUpdateRequestDto requestDto) {
        // TODO: Answer 조회 후 작성자 검증 및 수정
        return null;
    }

    @Override
    public void deleteAnswer(Long answerId, Long userId) {
        // TODO: Answer 조회 후 작성자 검증 및 삭제
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnswerResponseDto> getAnswersByQuestion(Long questionId) {
        // TODO: 질문별 답변 조회 및 DTO 변환
        return List.of();
    }

    @Override
    public void selectAnswer(Long answerId, Long userId) {
        // TODO: 질문 작성자 검증 후 채택
    }

    @Override
    public void voteAnswer(Long answerId, Long userId) {
        // TODO: 추천 기능
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Answer> getAnswersByUserId(Long userId, Pageable pageable) {
        return answerRepository.findByUserId(userId, pageable);
    }
}
