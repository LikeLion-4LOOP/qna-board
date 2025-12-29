package com.example.qnaboard.service.comment;

import com.example.qnaboard.domain.comment.Comment;
import com.example.qnaboard.dto.comment.request.CommentCreateRequest;
import com.example.qnaboard.dto.comment.request.CommentUpdateRequest;
import com.example.qnaboard.dto.comment.response.CommentResponse;
import com.example.qnaboard.dto.user.response.MyCommentSummaryResponse;
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

    private static final Long TEMP_USER_ID = 1L; // Security 전 임시 사용자

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    /* ================= 댓글 작성 ================= */

    public Long createComment(
            Long postId,
            Boolean isQuestion,
            CommentCreateRequest request
    ) {
        Long loginUserId = getTempLoginUserId();

        Comment comment = new Comment(
                request.content(),
                loginUserId,
                isQuestion,
                postId
        );

        return commentRepository.save(comment).getId();
    }

    /* ================= 댓글 목록 조회 (post 기준) ================= */

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentList(
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
                        new CommentResponse.UserResponse(
                                comment.getUserId()
                        )
                ));
    }
    /* ================= 댓글 목록 조회 (사용자 id 기준) ================= */

    @Transactional(readOnly = true)
    public Page<MyCommentSummaryResponse> getMyComments(
            Long userId,
            Pageable pageable
    ) {
        return commentRepository.findByUserId(userId, pageable)
                .map(comment -> new MyCommentSummaryResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.isQuestion(),
                        comment.getPostId(),
                        comment.getCreatedAt().toString()
                ));
    }


    /* ================= 댓글 수정 ================= */

    public void updateComment(
            Long commentId,
            CommentUpdateRequest request
    ) {
        Long loginUserId = getTempLoginUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND)
                );

        validateOwner(comment, loginUserId);
        comment.updateContent(request.content());
    }

    /* ================= 댓글 삭제 ================= */

    public void deleteComment(Long commentId) {
        Long loginUserId = getTempLoginUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND)
                );

        validateOwner(comment, loginUserId);
        commentRepository.delete(comment);
    }

    /* ================= 공통 로직 ================= */

    private Long getTempLoginUserId() {
        return TEMP_USER_ID;
    }

    private void validateOwner(Comment comment, Long loginUserId) {
        if (!comment.getUserId().equals(loginUserId)) {
            throw new BusinessException(CommentErrorCode.COMMENT_FORBIDDEN);
        }
    }
}