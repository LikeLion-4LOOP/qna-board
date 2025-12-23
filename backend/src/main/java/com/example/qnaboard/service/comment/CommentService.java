package com.example.qnaboard.service.comment;

import com.example.qnaboard.dto.comment.response.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    /* 댓글 작성 */
    public CommentResponse createComment() {
        return null;
    }

    /* 댓글 목록 조회 */
    // 게시글에 달린 댓글 목록 조회
    public Page<CommentResponse> getCommentsByPost(
            Long postId,
            boolean isQuestion,
            Pageable pageable
    ) {
        return null;
    }

    // 내가 작성한 댓글 목록 조회
    public Page<CommentResponse> getMyComments(
            Long userId,
            Pageable pageable
    ) {
        return null;
    }

    /* 댓글 수정 */
    public CommentResponse updateComment() {
        return null;
    }

    /* 댓글 삭제 */
    public void deleteComment() {
    }

}