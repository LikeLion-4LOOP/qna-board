package com.example.qnaboard.controller.answer;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.service.answer.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {
    private final AnswerService answerService;

    // userId 기준 Pageable 조회
    @GetMapping("/user/{userId}")
    public Page<Answer> getAnswersByUser(@PathVariable Long userId, Pageable pageable) {
        return answerService.getAnswersByUserId(userId, pageable);
    }
}
