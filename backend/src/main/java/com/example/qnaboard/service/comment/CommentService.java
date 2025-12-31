package com.example.qnaboard.service.comment;

import com.example.qnaboard.domain.comment.Comment;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.comment.request.CommentCreateRequest;
import com.example.qnaboard.dto.comment.request.CommentUpdateRequest;
import com.example.qnaboard.dto.comment.response.CommentResponse;
import com.example.qnaboard.dto.user.response.MyCommentSummaryResponse;
import com.example.qnaboard.exception.CommentErrorCode;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.comment.CommentRepository;
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    /* ================= 댓글 작성 ================= */

    public Long createComment(
            Long userId,
            Long postId,
            Boolean isQuestion,
            CommentCreateRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        Comment comment = new Comment(
                request.content(),
                user,
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
                .findByPostIdAndQuestion(postId, isQuestion, pageable)
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getPostId(),
                        comment.isQuestion(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        new CommentResponse.UserResponse(
                                comment.getId()
                        )
                ));
    }

    /* ================= 댓글 목록 조회 (사용자 기준) ================= */

    @Transactional(readOnly = true)
    public Page<MyCommentSummaryResponse> getMyComments(
            Long userId,
            Pageable pageable
    ) {
        return commentRepository.findByUser_Id(userId, pageable)
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
            Long userId,
            Long commentId,
            CommentUpdateRequest request
    ) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND)
                );

        validateOwner(comment, userId); //본인 댓글만 수정 가능

        comment.updateContent(request.content());
    }

    /* ================= 댓글 삭제 ================= */

    public void deleteComment(
            Long userId,
            Long commentId
    ) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new BusinessException(CommentErrorCode.COMMENT_NOT_FOUND)
                );

        validateOwner(comment, userId); //본인 댓글만 삭제 가능

        commentRepository.delete(comment);
    }

    /* ================= 공통 로직 ================= */

    private void validateOwner(Comment comment, Long userId) {
        if (!comment.getUser().getId().equals(userId)) {
            throw new BusinessException(CommentErrorCode.COMMENT_FORBIDDEN);
        }
    }
}