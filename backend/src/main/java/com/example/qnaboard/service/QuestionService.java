package com.example.qnaboard.service;

import com.example.qnaboard.dto.QuestionResponseDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {
    private final QuestionRepository questionRepository;

    // 질문 목록 조회
    public List<QuestionResponseDTO>
}
