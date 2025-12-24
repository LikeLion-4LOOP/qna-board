package com.example.qnaboard.dto.user.response;

import com.example.qnaboard.domain.user.Level;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private int point;
    private Level level;
}
