package com.example.qnaboard.service.answer;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.domain.answer.AnswerVote;
import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.answer.AnswerCreateRequest;
import com.example.qnaboard.dto.answer.AnswerResponseDto;
import com.example.qnaboard.dto.answer.AnswerUpdateRequestDto;
import com.example.qnaboard.exception.AnswerErrorCode;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.answer.AnswerRepository;
import com.example.qnaboard.repository.answer.AnswerVoteRepository;
import com.example.qnaboard.repository.question.QuestionRepository;
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AnswerVoteRepository answerVoteRepository;

    @Override
    public AnswerResponseDto createAnswer(Long questionId, Long userId, AnswerCreateRequest requestDto) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }
        validateContent(requestDto.getContent());

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(AnswerErrorCode.QUESTION_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        Answer answer = new Answer(requestDto.getContent(), question, user);

        return AnswerResponseDto.from(answerRepository.save(answer));
    }

    @Override
    public AnswerResponseDto updateAnswer(Long answerId, Long userId, AnswerUpdateRequestDto requestDto) {
        validateContent(requestDto.getContent());

        Answer answer = getAnswerOrThrow(answerId);
        validateOwner(answer, userId);

        answer.updateContent(requestDto.getContent());
        return AnswerResponseDto.from(answer);
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
        return answerRepository
                .findByQuestion_IdOrderByIsSelectDescCreatedAtDesc(questionId, pageable)
                .map(AnswerResponseDto::from);
    }

    @Override
    public void selectAnswer(Long answerId, Long userId) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }

        Answer target = getAnswerOrThrow(answerId);

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        String questionOwnerUsername = target.getQuestion().getUsername(); // Question에 있는 필드
        if (questionOwnerUsername == null || !questionOwnerUsername.equals(actor.getUsername())) {
            throw new BusinessException(AnswerErrorCode.ANSWER_FORBIDDEN);
        }

        Long questionId = target.getQuestion().getId();

        answerRepository.findByQuestion_IdAndIsSelectTrue(questionId)
                .ifPresent(selected -> {
                    if (!selected.getId().equals(answerId)) {
                        selected.unselect();
                        answerRepository.save(selected);
                    }
                });

        if (!target.isSelect()) {
            target.select();
            answerRepository.save(target);
        }
    }// 유의점: username이 변경될 수 있으면 나중에 불안정해질 수 있음, 채택 권한검증을 “username 기반으로 임시처리

    @Override
    @Transactional
    public void voteAnswer(Long answerId, Long userId) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }

        Answer answer = getAnswerOrThrow(answerId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        // 중복 추천 방지
        if (answerVoteRepository.existsByAnswer_IdAndUser_Id(answerId, userId)) {
            throw new BusinessException(AnswerErrorCode.ALREADY_VOTED);
        }

        answerVoteRepository.save(new AnswerVote(answer, user));

        // setter 대신 도메인 메서드 사용
        answer.upVote();

        // 트랜잭션이면 사실 save 없어도 dirty checking으로 반영되지만,
        // 명확하게 하려면 유지해도 OK
        answerRepository.save(answer);
    }

    @Override
    public Page<AnswerResponseDto> getAnswersByUser(Long userId, Pageable pageable) {
        return answerRepository.findByUser_Id(userId, pageable)
                .map(AnswerResponseDto::from);
    }

    /* ===== private ===== */

    private void validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BusinessException(AnswerErrorCode.ANSWER_CONTENT_EMPTY);
        }
    }

    private Answer getAnswerOrThrow(Long answerId) {
        return answerRepository.findById(answerId)
                .orElseThrow(() -> new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND));
    }

    private void validateOwner(Answer answer, Long userId) {
        if (!answer.getUser().getId().equals(userId)) {
            throw new BusinessException(AnswerErrorCode.ANSWER_FORBIDDEN);
        }
    }
}