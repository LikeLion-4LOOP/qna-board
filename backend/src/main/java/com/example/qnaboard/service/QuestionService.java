package com.example.qnaboard.service;

import com.example.qnaboard.dto.QuestionResponseDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {
    // private final QuestionRepository questionRepository;

    // 질문 목록 조회
    public List<QuestionResponseDTO>questionResponseDTOS;
}