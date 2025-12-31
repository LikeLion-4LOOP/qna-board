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
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {
    private final QuestionRepository questionRepository; // ✅ 추가
    private final UserRepository userRepository;

    /**
     * 1️⃣ 질문 등록
     */
    public Long createQuestion(Long userId, QuestionCreateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        Question question = Question.builder()
                .title(request.title())
                .content(request.content())
                .category(request.category())   // ✅ 카테고리
                .user(user)
                .build();

        return questionRepository.save(question).getId();
    }

    /**
     * 2️⃣ 질문 전체 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionList(Pageable pageable) {

        return questionRepository.findAll(pageable)
                .map(question -> new QuestionResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getContent(),
                        new QuestionResponse.CategoryResponse(
                                question.getCategory().name(),
                                question.getCategory().getDisplayName()
                        ),
                        question.getCreatedAt(),
                        new QuestionResponse.UserResponse(
                                question.getUser().getId(),
                                question.getUser().getUsername()
                        )
                ));
    }

    /**
     * 3️⃣ 질문 상세 조회 (+ 조회수 증가)
     */
    public QuestionResponse getQuestionDetail(Long questionId) {

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        // ✅ 조회수 증가
        question.addViewCount();

        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                new QuestionResponse.CategoryResponse(
                        question.getCategory().name(),
                        question.getCategory().getDisplayName()
                ),
                question.getCreatedAt(),
                new QuestionResponse.UserResponse(
                        question.getUser().getId(),
                        question.getUser().getUsername()
                )
        );
    }

    /**
     * 4️⃣ 질문 수정 (카테고리 변경 가능)
     */
    public void updateQuestion(
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
    }

    /**
     * 5️⃣ 질문 삭제
     */
    public void deleteQuestion(Long userId, Long questionId) {

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        validateOwner(question, userId);

        questionRepository.delete(question);
    }

    /**
     * 6️⃣ 내가 쓴 질문 조회
     */
    @Transactional(readOnly = true)
    public Page<MyQuestionSummaryResponse> getMyQuestions(Long userId, Pageable pageable) {

        return questionRepository.findByUser_Id(userId, pageable)
                .map(question -> new MyQuestionSummaryResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getCreatedAt().toString()
                ));
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
        if (keyword != null && !keyword.isBlank()) {    // keyword가 비어있지 않으면 검색, 비어있으면 전체 조회
            questions = questionRepository.findByTitleContainingOrContentContaining(keyword, keyword, pageable);
        } else {
            questions = questionRepository.findAll(pageable);
        }
        return questions.map(this::convertToQuestionResponse);
    }

    private QuestionResponse convertToQuestionResponse(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getCreatedAt(),
                new QuestionResponse.UserResponse(
                        question.getUser().getId(),
                        question.getUser().getUsername()
                )
        );
    }
}
