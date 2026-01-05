package com.example.qnaboard.service.question;

import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.question.request.QuestionCreateRequest;
import com.example.qnaboard.dto.question.request.QuestionUpdateRequest;
import com.example.qnaboard.dto.question.response.QuestionResponse;
import com.example.qnaboard.dto.user.response.MyQuestionSummaryResponse;
import com.example.qnaboard.exception.QuestionErrorCode;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.question.QuestionRepository;
import com.example.qnaboard.repository.answer.AnswerRepository;
import com.example.qnaboard.repository.user.UserRepository;
import com.example.qnaboard.service.point.UserPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final UserPointService userPointService;

    /**
     * 1️⃣ 질문 등록 (카테고리 + 포인트 지급)
     */
    public QuestionResponse createQuestion(
            Long userId,
            QuestionCreateRequest request
    ) {
        // 작성자 유저 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        // 질문 생성 (카테고리 포함)
        Question question = Question.builder()
                .title(request.title())
                .content(request.content())
                .category(request.category())   // ✅ 카테고리 저장
                .user(user)
                .build();

        // 포인트 지급
        userPointService.rewardForPostQuestion(userId);

        Question saved = questionRepository.save(question);

        return toResponse(saved);
    }

    /**
     * 2️⃣ 질문 전체 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionList(Pageable pageable) {
        return questionRepository.findAllByIsHiddenFalse(pageable)
                .map(this::toResponse);
    }

    /**
     * 3️. 질문 상세 조회 (+ 조회수 증가)
     */
    @Transactional
    public QuestionResponse getQuestionDetail(Long questionId) {

        Question question = questionRepository.findByIdAndIsHiddenFalse(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        //조회수 증가
        question.addViewCount();

        return toResponse(question);
    }

    /**
     * 4️⃣ 질문 수정 (카테고리 변경 가능)
     */
    public QuestionResponse updateQuestion(
            Long userId,
            Long questionId,
            QuestionUpdateRequest request
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        validateOwner(question, userId);

        question.update(
                request.title(),
                request.content(),
                request.category()   // ✅ 카테고리 수정
        );

        return toResponse(question);
    }

    /**
     * 5️⃣ 질문 삭제
     */
    public void deleteQuestion(
            Long userId,
            Long questionId
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        validateOwner(question, userId);
        userPointService.cancelRewardForQuestion(userId);
        questionRepository.delete(question);
    }

    /**
     * 6️⃣ 내가 쓴 질문 조회
     */
    @Transactional(readOnly = true)
    public Page<MyQuestionSummaryResponse> getMyQuestions(Long userId, Pageable pageable) {
        return questionRepository.findByUser_IdAndIsHiddenFalse(userId, pageable)
                .map(question -> new MyQuestionSummaryResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getCreatedAt().toString()
                ));
    }

    /**
     *  Question → QuestionResponse 공통 변환
     */
    private QuestionResponse toResponse(Question question) {
        int answerCount = answerRepository.countByQuestion_IdAndIsHiddenFalse(question.getId());
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getViewCount(),
                answerCount,
                new QuestionResponse.CategoryResponse(
                        question.getCategory().name(),
                        question.getCategory().getDisplayName()
                ),
                question.getCreatedAt(),
                question.getUpdatedAt(),
                new QuestionResponse.UserResponse(
                        question.getUser().getId(),
                        question.getUser().getUsername()
                )
        );
    }

    /**
     * 🔒 작성자 검증
     */
    private void validateOwner(Question question, Long userId) {
        if (!question.getUser().getId().equals(userId)) {
            throw new BusinessException(QuestionErrorCode.UNAUTHORIZED_USER);
        }
    }

    // 질문 목록 검색 기능 new !
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionList(String keyword, Pageable pageable) {
        Page<Question> questions;
        if (keyword != null && !keyword.isBlank()) {
            questions = questionRepository
                    .findByIsHiddenFalseAndTitleContainingOrIsHiddenFalseAndContentContaining(keyword, keyword, pageable);
        } else {
            questions = questionRepository.findAllByIsHiddenFalse(pageable);
        }
        return questions.map(this::convertToQuestionResponse);
    }

    private QuestionResponse convertToQuestionResponse(Question question) {
        int answerCount = answerRepository.countByQuestion_IdAndIsHiddenFalse(question.getId());
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getViewCount(),
                answerCount,
                new QuestionResponse.CategoryResponse(question.getCategory().name(),question.getCategory().getDisplayName()),
                question.getCreatedAt(),
                question.getUpdatedAt(),
                new QuestionResponse.UserResponse(
                        question.getUser().getId(),
                        question.getUser().getUsername()
                )
        );
    }
}