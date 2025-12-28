package com.example.qnaboard.service.answer;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.dto.answer.AnswerCreateRequest;
import com.example.qnaboard.dto.answer.AnswerResponseDto;
import com.example.qnaboard.dto.answer.AnswerUpdateRequestDto;
import com.example.qnaboard.exception.AnswerErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.answer.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;

    @Override
    public AnswerResponseDto createAnswer(Long questionId, Long userId, AnswerCreateRequest requestDto) {
        validateContent(requestDto.getContent());

        Answer answer = new Answer();
        answer.setContent(requestDto.getContent());
        answer.setQuestionId(questionId);   // 임시 필드
        answer.setUserId(userId);           // 임시 필드
        answer.setVote(0);
        answer.setSelect(false);
        answer.setCreatedAt(LocalDateTime.now());
        answer.setUpdatedAt(LocalDateTime.now());

        Answer saved = answerRepository.save(answer);
        return AnswerResponseDto.from(saved);
    }

    @Override
    public AnswerResponseDto updateAnswer(Long answerId, Long userId, AnswerUpdateRequestDto requestDto) {
        validateContent(requestDto.getContent());

        Answer answer = getAnswerOrThrow(answerId);
        validateOwner(answer, userId);

        answer.setContent(requestDto.getContent());
        answer.setUpdatedAt(LocalDateTime.now());

        Answer saved = answerRepository.save(answer);
        return AnswerResponseDto.from(saved);
    }

    @Override
    public void deleteAnswer(Long answerId, Long userId) {
        Answer answer = getAnswerOrThrow(answerId);
        validateOwner(answer, userId);

        if (answer.isSelect()) {
            throw new BusinessException(AnswerErrorCode.ANSWER_SELECTED_CANNOT_DELETE);
        }

        answerRepository.delete(answer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnswerResponseDto> getAnswersByQuestion(Long questionId, Pageable pageable) {
        Page<Answer> answerPage =
                answerRepository.findByQuestionId(questionId, pageable);

        return answerPage.map(AnswerResponseDto::from);
    }

    @Override
    public void selectAnswer(Long answerId, Long userId) {
        Answer target = getAnswerOrThrow(answerId);

        Long questionId = target.getQuestionId();
        if (questionId == null) {
            throw new BusinessException(AnswerErrorCode.ANSWER_CANNOT_SELECT_NO_QUESTION);
        }

        // TODO: Question 엔티티 연동 후 질문 작성자 검증
        // if (!questionOwnerId.equals(userId)) {
        //     throw new BusinessException(AnswerErrorCode.ANSWER_FORBIDDEN);
        // }

        answerRepository.findByQuestionIdAndIsSelectTrue(questionId)
                .ifPresent(selected -> {
                    if (!selected.getId().equals(answerId)) {
                        selected.setSelect(false);
                        selected.setUpdatedAt(LocalDateTime.now());
                        answerRepository.save(selected);
                    }
                });

        if (!target.isSelect()) {
            target.setSelect(true);
            target.setUpdatedAt(LocalDateTime.now());
            answerRepository.save(target);
        }
    }

    @Override
    public void voteAnswer(Long answerId, Long userId) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }

        Answer answer = getAnswerOrThrow(answerId);

        // TODO: 중복 추천 방지 (AnswerVoteRepository)
        answer.setVote(answer.getVote() + 1);
        answer.setUpdatedAt(LocalDateTime.now());

        answerRepository.save(answer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Answer> getAnswersByUserId(Long userId, Pageable pageable) {
        return answerRepository.findByUserId(userId, pageable);
    }

    /* ======================
       공통 private 메서드
       ====================== */

    private void validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BusinessException(AnswerErrorCode.ANSWER_CONTENT_EMPTY);
        }
    }

    private Answer getAnswerOrThrow(Long answerId) {
        return answerRepository.findById(answerId)
                .orElseThrow(() ->
                        new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND));
    }

    private void validateOwner(Answer answer, Long userId) {
        if (answer.getUserId() == null
                || userId == null
                || !answer.getUserId().equals(userId)) {
            throw new BusinessException(AnswerErrorCode.ANSWER_FORBIDDEN);
        }
    }
}