package com.example.qnaboard.controller.auth;


import com.example.qnaboard.dto.auth.request.LoginRequest;
import com.example.qnaboard.dto.auth.request.LogoutRequest;
import com.example.qnaboard.dto.auth.request.RefreshRequest;
import com.example.qnaboard.dto.auth.response.TokenResponse;
import com.example.qnaboard.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    /**
     * 로그인: access + refresh 발급
     */
    @PostMapping("/login")
    public TokenResponse login(@RequestBody LoginRequest req) {
        return authService.login(req.getUserId(), req.getPassword(), req.getDeviceId());
    }

    /**
     * 재발급: refresh로 access(+refresh rotation) 재발급
     */
    @PostMapping("/refresh")
    public TokenResponse refresh(@RequestBody RefreshRequest req) {
        return authService.refresh(req.getRefreshToken(), req.getDeviceId());
    }

    /**
     * 로그아웃: 해당 refresh 폐기
     */
    @PostMapping("/logout")
    public void logout(@RequestBody LogoutRequest req) {
        authService.logout(req.getRefreshToken());
    }
}
