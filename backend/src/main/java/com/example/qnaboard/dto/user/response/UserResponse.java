package com.example.qnaboard.dto.user.response;

import com.example.qnaboard.domain.user.Level;
import com.example.qnaboard.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String userId;
    private String username;
    private int point;
    private Level level;
    private Role role;
}
