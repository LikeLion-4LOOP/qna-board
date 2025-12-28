package com.example.qnaboard.controller.user;

import com.example.qnaboard.dto.user.request.SignupRequest;
import com.example.qnaboard.dto.user.request.UpdateUsernameRequest;
import com.example.qnaboard.dto.user.response.*;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    /**
     * 내 정보 조회
     */
    @GetMapping("/")
    public UserResponse getUser(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return userService.getUser(customUserDetails.getUserId());
    }

    //회원가입
    @PostMapping("/signup")
    public SignupResponse signup(@Valid @RequestBody SignupRequest req) {
        return userService.signup(req);
    }

    // 내 정보 수정 (username)
    @PatchMapping("/")
    public UserResponse updateUsername(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody UpdateUsernameRequest request
    ) {
        return userService.updateUsername(customUserDetails.getUserId(), request.getUsername());
    }

    // 내가 작성한 질문 목록
    @GetMapping("/questions")
    public Page<MyQuestionSummaryResponse> myQuestions(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            Pageable pageable
    ) {
        return userService.getMyQuestions(customUserDetails.getUserId(), pageable);
    }

    // 내가 작성한 답변 목록
    @GetMapping("/answers")
    public Page<MyAnswerSummaryResponse> myAnswers(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            Pageable pageable
    ) {
        return userService.getMyAnswers(customUserDetails.getUserId(), pageable);
    }

    // 내가 작성한 댓글 목록
    @GetMapping("/comments")
    public Page<MyCommentSummaryResponse> myComments(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            Pageable pageable
    ) {
        return userService.getMyComments(customUserDetails.getUserId(), pageable);
    }
}
