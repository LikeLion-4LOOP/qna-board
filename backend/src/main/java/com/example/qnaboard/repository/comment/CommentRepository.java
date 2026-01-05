package com.example.qnaboard.repository.comment;

import com.example.qnaboard.domain.comment.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    //질문/답변에 달린 댓글 목록
    Page<Comment> findByPostIdAndQuestion(
            Long postId,
            boolean question,
            Pageable pageable
    );

    //내가 작성한 댓글 목록
    Page<Comment> findByUser_Id(
            Long userId,
            Pageable pageable
    );
    // 신고
    Page<Comment> findByPostIdAndQuestionAndIsHiddenFalse(Long postId, boolean question, Pageable pageable);

    Page<Comment> findByUser_IdAndIsHiddenFalse(Long userId, Pageable pageable);
}