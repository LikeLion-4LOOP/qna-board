package com.example.qnaboard.service.question;

import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.question.QuestionCategory;
import com.example.qnaboard.domain.report.ReportTargetType;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.question.request.QuestionCreateRequest;
import com.example.qnaboard.dto.question.request.QuestionUpdateRequest;
import com.example.qnaboard.dto.question.response.QuestionResponse;
import com.example.qnaboard.dto.user.response.MyQuestionSummaryResponse;
import com.example.qnaboard.exception.QuestionErrorCode;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.answer.AnswerRepository;
import com.example.qnaboard.repository.question.QuestionRepository;
import com.example.qnaboard.repository.report.ReportRepository;
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
    private final UserRepository userRepository;
    private final UserPointService userPointService;
    private final ReportRepository reportRepository;
    private final AnswerRepository answerRepository;

    /**
     * 1️⃣ 질문 등록 (카테고리 + 포인트 지급)
     */
    public QuestionResponse createQuestion(Long userId, QuestionCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        Question question = Question.builder()
                .title(request.title())
                .content(request.content())
                .category(request.category())
                .user(user)
                .build();

        userPointService.rewardForPostQuestion(userId);

        Question saved = questionRepository.save(question);
        return toResponse(saved);
    }

    /**
     * 2️⃣ 질문 전체 목록 조회 (숨김 제외)
     */
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionList(Pageable pageable) {
        return questionRepository.findAllByIsHiddenFalse(pageable)
                .map(this::toResponse);
    }

    /**
     * ✅ 질문 목록 검색(검색 + 카테고리 필터) (숨김 제외)
     */
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionList(String keyword, String category, Pageable pageable) {
        QuestionCategory parsedCategory = parseCategoryOrNull(category);
        String normalizedKeyword = normalizeKeyword(keyword);

        return questionRepository.searchVisible(normalizedKeyword, parsedCategory, pageable)
                .map(this::toResponse);
    }

    /**
     * 3️⃣ 질문 상세 조회
     */
    public QuestionResponse getQuestionDetail(Long questionId) {
        Question question = questionRepository.findByIdAndIsHiddenFalse(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        question.addViewCount();
        return toResponse(question);
    }

    /**
     * 4️⃣ 질문 수정
     */
    public QuestionResponse updateQuestion(Long userId, Long questionId, QuestionUpdateRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        validateOwner(question, userId);

        question.update(request.title(), request.content(), request.category());
        return toResponse(question);
    }

    /**
     * 5️⃣ 질문 삭제 (작성자만)
     */
    public void deleteQuestion(Long userId, Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        validateOwner(question, userId);
        userPointService.cancelRewardForQuestion(userId);
        questionRepository.delete(question);

    }

    /**
     * ✅ 관리자 질문 삭제
     */
    public void deleteQuestionByAdmin(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        Long writerId = question.getUser().getId();
        userPointService.cancelRewardForQuestion(writerId);
        questionRepository.delete(question);
        reportRepository.deleteByTargetTypeAndTargetId(ReportTargetType.QUESTION,questionId);
    }

    /**
     * 6️⃣ 내가 쓴 질문 조회 (숨김 제외)
     */
    @Transactional(readOnly = true)
    public Page<MyQuestionSummaryResponse> getMyQuestions(Long userId, Pageable pageable) {
        return questionRepository.findByUser_IdAndIsHiddenFalse(userId, pageable)
                .map(q -> new MyQuestionSummaryResponse(
                        q.getId(),
                        q.getTitle(),
                        q.getCreatedAt().toString()
                ));
    }

    /* =========================
       private helpers
       ========================= */

    private QuestionCategory parseCategoryOrNull(String category) {
        if (category == null || category.isBlank()) return null;
        try {
            return QuestionCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null; // 잘못된 값이면 필터 적용 안 함
        }
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) return null;
        String k = keyword.trim();
        return k.isEmpty() ? null : k;
    }

    private QuestionResponse toResponse(Question question) {
        // 숨김 처리되지 않은 답변 수만 카운팅
        int visibleAnswerCount = answerRepository.countByQuestion_IdAndIsHiddenFalse(question.getId());
        
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getViewCount(),
                visibleAnswerCount,
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

    private void validateOwner(Question question, Long userId) {
        if (!question.getUser().getId().equals(userId)) {
            throw new BusinessException(QuestionErrorCode.UNAUTHORIZED_USER);
        }
    }
}
