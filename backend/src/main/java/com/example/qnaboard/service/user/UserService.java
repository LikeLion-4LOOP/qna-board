package com.example.qnaboard.service.user;

import com.example.qnaboard.domain.auth.RefreshToken;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.user.request.SignupRequest;
import com.example.qnaboard.dto.user.request.UserChangePassword;
import com.example.qnaboard.dto.user.response.*;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.auth.RefreshTokenRepository;
import com.example.qnaboard.repository.user.UserRepository;
import com.example.qnaboard.service.answer.AnswerService; // 프로젝트에 있는 AnswerService 인터페이스 기준
import com.example.qnaboard.service.answer.AnswerServiceImpl;
import com.example.qnaboard.service.comment.CommentService;

import com.example.qnaboard.service.quesiton.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AnswerServiceImpl answerService;
    private final CommentService commentService;
    private final QuestionService questionService;

    /**
     * 회원가입
     */

    @Transactional
    public SignupResponse signup(SignupRequest req) {
        String userid = req.getUserId();
        String password = req.getPassword();
        String username = req.getUsername();


        if (userRepository.existsByUsername(username)) {
            throw new BusinessException(UserErrorCode.ID_ALREADY_EXISTS);
        }

        String encoded = passwordEncoder.encode(password);

        User saved = userRepository.save(new User(userid, encoded ,username));

        return new SignupResponse(saved.getId(), saved.getUserId(),saved.getUsername());
    }

    @Transactional
    public void deleteUser(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    @Transactional
    public void changePassword(Long userId, UserChangePassword request){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.getCurrentPw(), user.getPassword())) {
            throw new BusinessException(UserErrorCode.WRONG_PASSWORD);
        }

        validateNewPassword(request.getChangePw());

        user.changePassword(passwordEncoder.encode(request.getChangePw()));

        //refreshToken 무효화
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser_IdAndRevokedFalse(userId);
        tokens.forEach(RefreshToken::revoke);

    }



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
        return questionService.getMyQuestions(userId, pageable)
                .map(question -> new MyQuestionSummaryResponse(
                        question.getId(),
                        question.getTitle(),
                        question.getCreatedAt()
        ));
    }

    /**
     * 내가 작성한 답변 목록
     * - AnswerServiceImpl.getAnswersByUserId(userId, pageable) 사용
     * - Page<AnswerResponseDto> -> Page<MyAnswerSummaryResponse> 변환
     */
    public Page<MyAnswerSummaryResponse> getMyAnswers(Long userId, Pageable pageable) {
        return answerService.getAnswersByUser(userId, pageable)
                .map(answer -> new MyAnswerSummaryResponse(
                        answer.getId(),
                        answer.getQuestionId(),
                        summarize(answer.getContent(), 30),
                        answer.getVote(),
                        answer.isSelect(),
                        answer.getCreatedAt().toString()
                ));
    }

    /**
     * 내가 작성한 댓글 목록
     * - CommentService.getMyComments(userId, pageable) 사용
     */
    public Page<MyCommentSummaryResponse> getMyComments(Long userId, Pageable pageable) {
        return commentService.getMyComments(userId, pageable)
                .map(comment -> new MyCommentSummaryResponse(
                        comment.getId(),
                        summarize(comment.getContent(),30),
                        comment.isQuestion(),
                        comment.getPostId(),
                        comment.getCreatedAt()
        ));
    }



    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUserId(),
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

    private void validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new BusinessException(UserErrorCode.PASSWORD_POLICY_VIOLATION);
        }
    }
}
