package com.example.qnaboard.service.user;

import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.user.response.*;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.user.UserRepository;
import com.example.qnaboard.service.AnswerService; // 프로젝트에 있는 AnswerService 인터페이스 기준
import com.example.qnaboard.service.comment.CommentService;
import com.example.qnaboard.dto.comment.response.CommentResponse; // 너가 준 CommentResponse

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    private final AnswerService answerService;
    private final CommentService commentService;

    /**
     * 내 정보 조회
     */
    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        return toUserResponse(user);
    }

    /**
     * 내 정보 수정 (현재는 이름만 수정)
     */
    @Transactional
    public UserResponse updateUsername(Long userId, String userName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        if (user.getUsername().equals(userName)) {
            return toUserResponse(user);
        }

        if (userRepository.existsByUsername(userName)) {
            throw new IllegalArgumentException("Duplicate username: " + userName);
        }

        user.updateUsername(userName);
        return toUserResponse(user);
    }

    /**
     * 내가 작성한 질문 목록
     * - QuestionService가 아직 없으니 스켈레톤 유지
     */
    public Page<MyQuestionSummaryResponse> getMyQuestions(Long userId, Pageable pageable) {
        /*return questionService.getMyQuestion(userId, pageable)
                .map(question -> new MyQuestionSummaryResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getTag(),
                        question.getCreatedAt(),
                        question.getIsSolved()
        ))*/
        return Page.empty(pageable);
    }

    /**
     * 내가 작성한 답변 목록
     * - AnswerServiceImpl.getAnswersByUserId(userId, pageable) 사용
     * - Page<Answer> -> Page<MyAnswerSummaryResponse> 변환
     */
    public Page<MyAnswerSummaryResponse> getMyAnswers(Long userId, Pageable pageable) {
        return answerService.getAnswersByUserId(userId, pageable)
                .map(answer -> new MyAnswerSummaryResponse(
                        answer.getId(),
                        //answer.question().getId(),
                        1L, //임시값
                        summarize(answer.getContent(), 30),
                        answer.getVote(),
                        answer.isSelect(),
                        answer.getCreatedAt().toString()
                ));
    }

    /**
     * 내가 작성한 댓글 목록
     * - CommentService.getMyComments(userId, pageable) 사용
     * - getMyComments 현재 미구현. 구현 완료시 코드 미리 작성
     */
    public Page<MyCommentSummaryResponse> getMyComments(Long userId, Pageable pageable) {
        /*return commentService.getMyComments(userId, pageable)
                .map(comment -> new MyCommentSummaryResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getTag(),
                        comment.getPostId(),
                        comment.getCreatedAt()
        ))*/
        return Page.empty();
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getPoint(),
                user.getLevel()
        );
    }

    private String summarize(String text, int maxLen) {
        if (text == null) return "";
        if (text.length() <= maxLen) return text;
        return text.substring(0, maxLen);
    }
}
