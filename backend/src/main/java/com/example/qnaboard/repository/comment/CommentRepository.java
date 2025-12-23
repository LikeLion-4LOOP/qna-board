package com.example.qnaboard.repository.comment;

import com.example.qnaboard.domain.comment.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

}