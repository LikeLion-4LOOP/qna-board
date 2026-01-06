package com.example.qnaboard.service.report;

import com.example.qnaboard.domain.comment.Comment;
import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.report.ReportTargetType;
import com.example.qnaboard.exception.AnswerErrorCode;
import com.example.qnaboard.exception.CommentErrorCode;
import com.example.qnaboard.exception.QuestionErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.answer.AnswerRepository;
import com.example.qnaboard.repository.comment.CommentRepository;
import com.example.qnaboard.repository.question.QuestionRepository;
import com.example.qnaboard.repository.report.ReportRepository;
import com.example.qnaboard.service.answer.AnswerServiceImpl;
import com.example.qnaboard.service.comment.CommentService;
import com.example.qnaboard.service.question.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    private final QuestionService questionService;
    private final AnswerServiceImpl answerService;
    private final CommentService commentService;

    @Transactional(readOnly = true)
    public Page<?> getHiddenTargets(ReportTargetType type, Pageable pageable) {
        return switch (type) {
            case QUESTION -> questionRepository.findAllByIsHiddenTrue(pageable);
            case ANSWER -> answerRepository.findAllByIsHiddenTrue(pageable);
            case COMMENT -> commentRepository.findAllByIsHiddenTrue(pageable);
        };
    }
    @Transactional
    public void delete(ReportTargetType type, Long id) {
        switch (type) {
            case QUESTION -> {
                questionService.deleteQuestionByAdmin(id);
            }
            case COMMENT -> {
                commentService.deleteCommentByAdmin(id);
            }
            case ANSWER -> {
                answerService.deleteAnswerByAdmin(id);
            }
        }
    }

    @Transactional
    public void restore(ReportTargetType type, Long id) {
        switch (type) {
            case QUESTION -> {
                questionRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND))
                        .unhide();
                reportRepository.deleteByTargetTypeAndTargetId(ReportTargetType.QUESTION,id);
            }
            case ANSWER -> {
                answerRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(AnswerErrorCode.ANSWER_NOT_FOUND))
                        .unhide();
                reportRepository.deleteByTargetTypeAndTargetId(ReportTargetType.ANSWER,id);
            }
            case COMMENT -> {
                commentRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND))
                        .unhide();
                reportRepository.deleteByTargetTypeAndTargetId(ReportTargetType.COMMENT,id);
            }
        }
    }
}
