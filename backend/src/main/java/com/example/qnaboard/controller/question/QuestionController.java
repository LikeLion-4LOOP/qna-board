package com.example.qnaboard.controller.question;

import com.example.qnaboard.dto.question.request.QuestionCreateRequest;
import com.example.qnaboard.dto.question.request.QuestionUpdateRequest;
import com.example.qnaboard.dto.question.response.QuestionResponse;
import com.example.qnaboard.dto.user.response.MyQuestionSummaryResponse;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.question.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // 1. 등록
    @PostMapping
    public ResponseEntity<QuestionResponse> register(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuestionCreateRequest request
    ) {
        QuestionResponse response = questionService.createQuestion(userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. 전체 목록 조회 (검색, 정렬, 카테고리 필터 지원)
    @GetMapping
    public Page<QuestionResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        // sortBy 파라미터에 따라 정렬 변경
        if (sortBy != null) {
            Sort sort;
            switch (sortBy.toLowerCase()) {
                case "popular":
                    // 인기순: 조회수 + 답변수*2 기준 (백엔드에서 계산)
                    sort = Sort.by(Sort.Direction.DESC, "viewCount", "createdAt");
                    break;
                case "answers":
                    // 답변 많은 순: answerCount 기준
                    sort = Sort.by(Sort.Direction.DESC, "answerCount", "createdAt");
                    break;
                case "latest":
                default:
                    // 최신순
                    sort = Sort.by(Sort.Direction.DESC, "createdAt");
                    break;
            }
            pageable = org.springframework.data.domain.PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    sort
            );
        }
        
        return questionService.getQuestionList(search, category, pageable);
    }

    // 3. 상세 조회
    @GetMapping("/{id}")
    public QuestionResponse getDetail(@PathVariable Long id) {
        return questionService.getQuestionDetail(id);
    }

    // 4. 수정
    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponse> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody QuestionUpdateRequest request
    ) {

        QuestionResponse updated = questionService.updateQuestion(userDetails.getUserId(), id, request);

        return ResponseEntity.ok(updated);
    }

    // 5. 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        questionService.deleteQuestion(userDetails.getUserId(), id);
        return ResponseEntity.noContent().build();
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