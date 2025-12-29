package com.example.qnaboard.service.quesiton;

import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.dto.question.QuestionDto;
import com.example.qnaboard.repository.question.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Transactional
    public void registerBoard(Question board) {
        questionRepository.save(board);
    }

    public List<Question> findAllBoards() {
        return questionRepository.findAll();
    }

    public Question findBoardById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다");
    }

    @Transactional
    public void updateBoard(Long id, QuestionDto requestDto) {
        Question question = findBoardById(id);
        question.update(requestDto.getTitle(), requestDto.getContent());
    }

    @Transactional
    public void deleteBoard(Long id) {
        questionRepository.deleteById(id);
    }
}