package com.example.qnaboard.service.quesiton;

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
import com.example.qnaboard.service.user.UserPointService;
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

    // 질문 등록
    public Long createQuestion(
            Long userId,
            QuestionCreateRequest request
    ) {
        // 작성자 유저 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        // 질문 엔티티 생성 및 빌드
        Question question = Question.builder()
                .title(request.title())
                .content(request.content())
                .user(user)
                .build();
        userPointService.rewardForPostQuestion(userId);

        return questionRepository.save(question).getId();
    }

    // 질문 전체 목록 조회
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionList(Pageable pageable) {
        return questionRepository.findAll(pageable)
                .map(question -> new QuestionResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getContent(),
                        question.getCreatedAt(),
                        new QuestionResponse.UserResponse(
                                question.getUser().getId(),
                                question.getUser().getUsername()
                        )
                ));
    }

    // 질문 상세 조회
    @Transactional
    public QuestionResponse getQuestionDetail(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

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

    // 질문 수정
    public void updateQuestion(
            Long userId,
            Long questionId,
            QuestionUpdateRequest request
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        // 본인 소유 확인
        validateOwner(question, userId);
        question.update(request.title(), request.content());
    }

    // 질문 삭제
    public void deleteQuestion(
            Long userId,
            Long questionId
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        // 본인 소유 확인
        validateOwner(question, userId);
        questionRepository.delete(question);
    }

    // MyQuestion
    @Transactional(readOnly = true)
    public Page<MyQuestionSummaryResponse> getMyQuestions(Long userId, Pageable pageable) {
        return questionRepository.findByUser_Id(userId, pageable)
                .map(question -> new MyQuestionSummaryResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getCreatedAt().toString()
                ));
    }

    // 검증
    private void validateOwner(Question question, Long userId) {
        // 엔티티의 유저 ID와 로그인한 유저 ID 비교
        if (!question.getUser().getId().equals(userId)) {
            throw new BusinessException(QuestionErrorCode.UNAUTHORIZED_USER);
        }
    }
}