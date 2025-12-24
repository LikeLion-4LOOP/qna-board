package com.example.qnaboard.service.comment;

import com.example.qnaboard.domain.comment.Comment;
import com.example.qnaboard.dto.comment.request.CommentCreateRequest;
import com.example.qnaboard.dto.comment.request.CommentUpdateRequest;
import com.example.qnaboard.dto.comment.response.CommentResponse;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.exception.CommentErrorCode;
import com.example.qnaboard.repository.comment.CommentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CommentService {

    private static final Long TEMP_USER_ID = 1L;

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    /* ================= 댓글 작성 ================= */

    public Long create(Long postId, Boolean isQuestion, CommentCreateRequest request) {
        Long loginUserId = getTempLoginUserId();

        Comment comment = new Comment(
                request.content(),
                loginUserId,
                isQuestion,
                postId
        );

        return commentRepository.save(comment).getId();
    }

    /* ================= 댓글 목록 조회 ================= */

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(
            Long postId,
            Boolean isQuestion,
            Pageable pageable
    ) {
        return commentRepository
                .findByPostIdAndIsQuestion(postId, isQuestion, pageable)
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getPostId(),
                        comment.isQuestion(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        new CommentResponse.UserResponse(comment.getUserId())
                ));
    }

    /* ================= 댓글 수정 ================= */

    public void update(Long commentId, CommentUpdateRequest request) {
        Long loginUserId = getTempLoginUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND)
                );

        validateOwner(comment, loginUserId);
        comment.updateContent(request.content());
    }

    /* ================= 댓글 삭제 ================= */

    public void delete(Long commentId) {
        Long loginUserId = getTempLoginUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND)
                );

        validateOwner(comment, loginUserId);
        commentRepository.delete(comment);
    }




    private Long getTempLoginUserId() {
        return TEMP_USER_ID;
    }

    private void validateOwner(Comment comment, Long loginUserId) {
        if (!comment.getUserId().equals(loginUserId)) {
            throw new BusinessException(CommentErrorCode.COMMENT_FORBIDDEN);
        }
    }
}