package com.example.qnaboard.controller.question;

import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.dto.question.QuestionDto;
import com.example.qnaboard.service.quesiton.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    public String register(@RequestBody Question question) {
        questionService.registerBoard(question);
        return "글 등록이 완료되었습니다!";
    }

    @GetMapping
    public List<Question> list() {
        return questionService.findAllBoards();
    }

    @GetMapping("/{id}")
    public Question getDetail(@PathVariable Long id) {
        return questionService.findBoardById(id);
    }

    @PutMapping("/{id}")
    public String update(@PathVariable Long id, @RequestBody QuestionDto dto) {
        questionService.updateBoard(id, dto);
        return "수정 완료";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        questionService.deleteBoard(id);
        return "삭제 완료";
    }
}