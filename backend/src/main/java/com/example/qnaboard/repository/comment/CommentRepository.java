package com.example.qnaboard.repository.comment;

import com.example.qnaboard.domain.comment.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    //질문/답변에 달린 댓글 목록
    Page<Comment> findByPostIdAndIsQuestion(
            Long postId,
            boolean isQuestion,
            Pageable pageable
    );

    //내가 작성한 댓글 목록
    Page<Comment> findByUserId(
            Long userId,
            Pageable pageable
    );
}