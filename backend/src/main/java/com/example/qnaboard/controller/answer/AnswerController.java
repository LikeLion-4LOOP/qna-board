package com.example.qnaboard.controller.answer;

import com.example.qnaboard.dto.answer.AnswerCreateRequest;
import com.example.qnaboard.dto.answer.AnswerResponseDto;
import com.example.qnaboard.dto.answer.AnswerUpdateRequestDto;
import com.example.qnaboard.service.answer.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    /**
     * 1. 답변 등록
     * POST /api/answers?questionId=1&userId=1
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnswerResponseDto createAnswer(
            @RequestParam Long questionId,
            @RequestParam Long userId,
            @RequestBody AnswerCreateRequest request
    ) {
        return answerService.createAnswer(questionId, userId, request);
    }

    /**
     * 2️. 답변 수정
     * PUT /api/answers/{answerId}?userId=1
     */
    @PutMapping("/{answerId}")
    public AnswerResponseDto updateAnswer(
            @PathVariable Long answerId,
            @RequestParam Long userId,
            @RequestBody AnswerUpdateRequestDto request
    ) {
        return answerService.updateAnswer(answerId, userId, request);
    }

    /**
     * 3️. 답변 삭제
     * DELETE /api/answers/{answerId}?userId=1
     */
    @DeleteMapping("/{answerId}")
    public void deleteAnswer(
            @PathVariable Long answerId,
            @RequestParam Long userId
    ) {
        answerService.deleteAnswer(answerId, userId);
    }

    /**
     * 4️. 질문별 답변 목록 조회
     * GET /api/answers?questionId=1&page=0&size=10
     */
    @GetMapping
    public Page<AnswerResponseDto> getAnswersByQuestion(
            @RequestParam Long questionId,
            Pageable pageable
    ) {
        return answerService.getAnswersByQuestion(questionId, pageable);
    }

    /**
     * 5️. 답변 채택
     * POST /api/answers/{answerId}/select?userId=1
     */
    @PostMapping("/{answerId}/select")
    public void selectAnswer(
            @PathVariable Long answerId,
            @RequestParam Long userId
    ) {
        answerService.selectAnswer(answerId, userId);
    }

    /**
     * 6️. 답변 추천
     * POST /api/answers/{answerId}/vote?userId=1
     */
    @PostMapping("/{answerId}/vote")
    public void voteAnswer(
            @PathVariable Long answerId,
            @RequestParam Long userId
    ) {
        answerService.voteAnswer(answerId, userId);
    }
}