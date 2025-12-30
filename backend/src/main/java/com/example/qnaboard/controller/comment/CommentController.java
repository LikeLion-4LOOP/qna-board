package com.example.qnaboard.controller.comment;

import com.example.qnaboard.dto.comment.request.CommentCreateRequest;
import com.example.qnaboard.dto.comment.request.CommentUpdateRequest;
import com.example.qnaboard.dto.comment.response.CommentResponse;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.comment.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /* ================= 댓글 작성 ================= */

    @PostMapping
    public Long createComment(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam Long postId,
            @RequestParam Boolean isQuestion,
            @RequestBody CommentCreateRequest request
    ) {
        return commentService.createComment(
                user.getUserId(),
                postId,
                isQuestion,
                request
        );
    }

    /* ================= 댓글 목록 조회 ================= */

    @GetMapping
    public Page<CommentResponse> getCommentList(
            @RequestParam Long postId,
            @RequestParam Boolean isQuestion,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return commentService.getCommentList(postId, isQuestion, pageable);
    }

    /* ================= 댓글 수정 ================= */

    @PatchMapping("/{commentId}")
    public void updateComment(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest request
    ) {
        commentService.updateComment(
                user.getUserId(),
                commentId,
                request
        );
    }

    /* ================= 댓글 삭제 ================= */

    @DeleteMapping("/{commentId}")
    public void deleteComment(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long commentId
    ) {
        commentService.deleteComment(
                user.getUserId(),
                commentId
        );
    }
}