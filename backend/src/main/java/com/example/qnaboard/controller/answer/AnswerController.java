package com.example.qnaboard.controller.answer;

import com.example.qnaboard.dto.answer.AnswerCreateRequest;
import com.example.qnaboard.dto.answer.AnswerResponseDto;
import com.example.qnaboard.dto.answer.AnswerUpdateRequestDto;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.answer.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    /**
     * 1) 답변 작성 (로그인 필요)
     * POST /api/questions/{questionId}/answers
     */
    @PostMapping("/questions/{questionId}/answers")
    @ResponseStatus(HttpStatus.CREATED)
    public AnswerResponseDto createAnswer(
            @PathVariable Long questionId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AnswerCreateRequest request
    ) {
        return answerService.createAnswer(questionId, userDetails.getUserId(), request);
    }

    /**
     * 2) 질문별 답변 목록 조회 (비로그인 허용)
     * GET /api/questions/{questionId}/answers?page=0&size=10
     */
    @GetMapping("/questions/{questionId}/answers")
    public Page<AnswerResponseDto> getAnswersByQuestion(
            @PathVariable Long questionId,
            Pageable pageable
    ) {
        return answerService.getAnswersByQuestion(questionId, pageable);
    }

    /**
     * 3) 답변 수정 (로그인 필요)
     * PATCH /api/answers/{answerId}
     */
    @PatchMapping("/answers/{answerId}")
    public AnswerResponseDto updateAnswer(
            @PathVariable Long answerId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AnswerUpdateRequestDto request
    ) {
        return answerService.updateAnswer(answerId, userDetails.getUserId(), request);
    }

    /**
     * 4) 답변 삭제 (로그인 필요)
     * DELETE /api/answers/{answerId}
     */
    @DeleteMapping("/answers/{answerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnswer(
            @PathVariable Long answerId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        answerService.deleteAnswer(answerId, userDetails.getUserId());
    }

    /**
     * 5) 답변 채택 (로그인 필요)
     * POST /api/answers/{answerId}/select
     */
    @PostMapping("/answers/{answerId}/select")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void selectAnswer(
            @PathVariable Long answerId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        answerService.selectAnswer(answerId, userDetails.getUserId());
    }

    /**
     * 6) 답변 추천 (로그인 필요)
     * POST /api/answers/{answerId}/vote
     */
    @PostMapping("/answers/{answerId}/vote")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void voteAnswer(
            @PathVariable Long answerId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        answerService.voteAnswer(answerId, userDetails.getUserId());
    }
    @GetMapping("/answers/{answerId}")
    public AnswerResponseDto getAnswerDetail(@PathVariable Long answerId) {
        return answerService.getAnswerDetail(answerId);
    }
}