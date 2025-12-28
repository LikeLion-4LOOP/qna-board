package com.example.qnaboard.security;

import com.example.qnaboard.domain.user.User;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class CustomUserDetails implements UserDetails {
    private final Long userId;
    private final String username;
    private final String password;

    public CustomUserDetails(User user) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
    }

    public Long getUserId() {
        return userId;
    }

    // [필수] 권한 목록
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    // [필수] 비밀번호 (로그인에서 matches 체크할 때 필요)
    @Override
    public String getPassword() {
        return password;
    }

    // [필수] username
    @Override
    public String getUsername() {
        return username;
    }
}
