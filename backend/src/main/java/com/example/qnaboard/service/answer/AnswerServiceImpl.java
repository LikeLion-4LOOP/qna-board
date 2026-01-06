package com.example.qnaboard.service.answer;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.domain.answer.AnswerVote;
import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.report.ReportTargetType;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.answer.AnswerCreateRequest;
import com.example.qnaboard.dto.answer.AnswerResponseDto;
import com.example.qnaboard.dto.answer.AnswerUpdateRequestDto;
import com.example.qnaboard.exception.AnswerErrorCode;
import com.example.qnaboard.exception.QuestionErrorCode;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.answer.AnswerRepository;
import com.example.qnaboard.repository.answer.AnswerVoteRepository;
import com.example.qnaboard.repository.question.QuestionRepository;
import com.example.qnaboard.repository.report.ReportRepository;
import com.example.qnaboard.repository.user.UserRepository;
import com.example.qnaboard.service.point.UserPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AnswerVoteRepository answerVoteRepository;
    private final UserPointService userPointService;
    private final ReportRepository reportRepository;

    @Override
    @Transactional
    public AnswerResponseDto createAnswer(Long questionId, Long userId, AnswerCreateRequest requestDto) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }
        validateContent(requestDto.getContent());

        Question question =   questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));
        // question errorcode 변경예정

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        Answer answer = new Answer(requestDto.getContent(), question, user);
        userPointService.rewardForPostAnswer(userId);
        
        // Question의 answerCount 증가
        question.incrementAnswerCount();

        return AnswerResponseDto.from(answerRepository.save(answer));
    }

    @Override
    @Transactional
    public AnswerResponseDto updateAnswer(Long answerId, Long userId, AnswerUpdateRequestDto requestDto) {
        requireLogin(userId);
        validateContent(requestDto.getContent());

        Answer answer = getAnswerOrThrow(answerId);
        validateOwner(answer, userId);

        answer.updateContent(requestDto.getContent());
        return AnswerResponseDto.from(answer);
    }

    @Override
    @Transactional
    public void deleteAnswer(Long answerId, Long userId) {
        requireLogin(userId);
        Answer answer = getAnswerOrThrow(answerId);
        validateOwner(answer, userId);

        if (answer.isSelect()) {
            throw new BusinessException(AnswerErrorCode.ANSWER_SELECTED_CANNOT_DELETE);
        }
        
        // Question의 answerCount 감소
        Question question = answer.getQuestion();
        question.decrementAnswerCount();
        
        userPointService.cancelRewardForAnswer(userId);
        answerRepository.delete(answer);
    }

    @Transactional
    public void deleteAnswerByAdmin(Long answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND));

        Question question = answer.getQuestion();
        question.decrementAnswerCount();

        Long writerId = answer.getUser().getId();
        userPointService.cancelRewardForAnswer(writerId);
        userPointService.cancelRewardForSelectedAnswer(writerId);
        answerRepository.delete(answer);
        reportRepository.deleteByTargetTypeAndTargetId(ReportTargetType.ANSWER,answerId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnswerResponseDto> getAnswersByQuestion(Long questionId, Pageable pageable) {
        return answerRepository
                .findByQuestion_IdAndIsHiddenFalseOrderByIsSelectDescCreatedAtDesc(questionId, pageable)
                .map(AnswerResponseDto::from);
    }

    @Override
    @Transactional
    public void selectAnswer(Long answerId, Long userId) {
        requireLogin(userId);

        Answer target = getAnswerOrThrow(answerId);

        // 1) 질문 작성자만 채택 가능
        Long questionOwnerId = target.getQuestion().getUser().getId();
        if (!questionOwnerId.equals(userId)) {
            throw new BusinessException(AnswerErrorCode.ANSWER_FORBIDDEN);
        }

        // 2) 자기 답변 채택 금지
        Long answerWriterId = target.getUser().getId();
        if (answerWriterId.equals(userId)) {
            throw new BusinessException(AnswerErrorCode.SELF_ANSWER_CANNOT_SELECT);
        }

        Long questionId = target.getQuestion().getId();

        // 3) 이미 채택된 답변이 있으면 변경 불가
        answerRepository.findByQuestion_IdAndIsSelectTrueAndIsHiddenFalse(questionId) // 변경
                .ifPresent(selected -> {
                    if (!selected.getId().equals(answerId)) {
                        throw new BusinessException(AnswerErrorCode.ALREADY_SELECTED);
                    }
                });

        // 4) 처음 채택될 때만 채택 처리 + 포인트 지급
        if (!target.isSelect()) {
            target.select();
            userPointService.rewardForSelectedAnswer(answerWriterId);
        }
    }

    @Override
    @Transactional
    public void voteAnswer(Long answerId, Long userId) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }

        Long answerPosterId = answerRepository.findById(answerId).orElseThrow(() ->
                new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND)).getUser().getId();

        Answer answer = getAnswerOrThrow(answerId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        try {
            // 중복 추천 방지 (DB unique 제약이 최종 보루)
            answerVoteRepository.save(new AnswerVote(answer, user));
        } catch (DataIntegrityViolationException e) {
            // (answer_id, user_pk) unique 충돌
            throw new BusinessException(AnswerErrorCode.ALREADY_VOTED);
        }

        // setter 대신 도메인 메서드 사용
        answer.upVote();
        userPointService.rewardForVote(answerPosterId);


        answerRepository.save(answer);
    }

    @Override
    @Transactional
    public void unvoteAnswer(Long answerId, Long userId) {
        if (userId == null) {
            throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
        }

        Answer answer = getAnswerOrThrow(answerId);
        Long answerPosterId = answerRepository.findById(answerId).orElseThrow(() ->
                new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND)).getUser().getId();

        Optional<AnswerVote> voteOpt = answerVoteRepository.findByAnswer_IdAndUser_Id(answerId, userId);
        if (voteOpt.isEmpty()) {
            throw new BusinessException(AnswerErrorCode.VOTE_NOT_FOUND);
        }

        answerVoteRepository.delete(voteOpt.get());
        answer.downVote();
        userPointService.cancelRewardForVote(answerPosterId);

        answerRepository.save(answer);
    }

    @Override
    public Page<AnswerResponseDto> getAnswersByUser(Long userId, Pageable pageable) {
        return answerRepository.findByUser_IdAndIsHiddenFalse(userId, pageable)
                .map(AnswerResponseDto::from);
    }
    @Override
    @Transactional
    public AnswerResponseDto getAnswerDetail(Long answerId) {
        Answer answer = getAnswerOrThrow(answerId);

        // 조회수 증가
        answer.increaseViewCount();

        return AnswerResponseDto.from(answer);
    }


    /* ===== private ===== */
    /**
     *검증
     */
    private void validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BusinessException(AnswerErrorCode.ANSWER_CONTENT_EMPTY);
        }
    }

    private Answer getAnswerOrThrow(Long answerId) {
        return answerRepository.findById(answerId)
                .filter(a -> !a.isHidden()) // isHidden getter가 boolean이면 isHidden() 가능 수정
                .orElseThrow(() -> new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND));
    }

    private void validateOwner(Answer answer, Long userId) {
        if (!answer.getUser().getId().equals(userId)) {
            throw new BusinessException(AnswerErrorCode.ANSWER_FORBIDDEN);
        }
    }
    private void requireLogin(Long userId) {
        if (userId == null) throw new BusinessException(AnswerErrorCode.LOGIN_REQUIRED);
    }
}