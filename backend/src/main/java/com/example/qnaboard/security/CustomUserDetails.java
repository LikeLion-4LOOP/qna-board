package com.example.qnaboard.security;

import com.example.qnaboard.domain.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class CustomUserDetails implements UserDetails {
    private final Long userId;
    private final String userLoginId;
    private final String username;
    private final String password;

    public CustomUserDetails(User user) {
        this.userId = user.getId();
        this.userLoginId = user.getUserId();
        this.username = user.getUsername();
        this.password = user.getPassword();
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserLoginId(){
        return userLoginId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }
}
