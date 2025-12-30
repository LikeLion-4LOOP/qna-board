package com.example.qnaboard.controller.question;

import com.example.qnaboard.dto.question.request.QuestionCreateRequest;
import com.example.qnaboard.dto.question.request.QuestionUpdateRequest;
import com.example.qnaboard.dto.question.response.QuestionResponse;
import com.example.qnaboard.dto.user.response.MyQuestionSummaryResponse;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.quesiton.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // 1. 등록
    @PostMapping
    public String register(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuestionCreateRequest request
    ) {
        questionService.createQuestion(userDetails.getUserId(), request);
        return "글 등록이 완료되었습니다!";
    }

    // 2. 전체 목록 조회
    @GetMapping
    public Page<QuestionResponse> list(@PageableDefault Pageable page) {
        return questionService.getQuestionList(page);
    }

    // 3. 상세 조회
    @GetMapping("/{id}")
    public QuestionResponse getDetail(@PathVariable Long id) {
        return questionService.getQuestionDetail(id);
    }

    // 4. 수정
    @PutMapping("/{id}")
    public String update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody QuestionUpdateRequest request
    ) {
        questionService.updateQuestion(userDetails.getUserId(), id, request);
        return "수정 완료";
    }

    // 5. 삭제
    @DeleteMapping("/{id}")
    public String delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        questionService.deleteQuestion(userDetails.getUserId(), id);
        return "삭제 완료";
    }

    // 6. 내가 쓴 글 조회
    @GetMapping("/userPost")
    public Page<MyQuestionSummaryResponse> getUserPost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault Pageable page
    ) {
        return questionService.getMyQuestions(userDetails.getUserId(), page);
    }
}