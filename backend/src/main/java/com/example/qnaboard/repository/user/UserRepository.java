package com.example.qnaboard.repository.user;

import com.example.qnaboard.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
}
