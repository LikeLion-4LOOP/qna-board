package com.example.qnaboard.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        log.debug("Authorization header = {}", header);
        if (header == null || !header.startsWith("Bearer ")) {
            log.debug("No bearer token. skip");
            filterChain.doFilter(request, response);
            return;
        }
        try {
            if(header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                log.debug("resolved token = {}", token != null);
                // 토큰 유효성 검사
                if (jwtProvider.validate(token) && "access".equals(jwtProvider.getType(token))) {

                    Long userId = jwtProvider.getUserId(token);
                    log.debug("userId from token = {}", userId);

                    UserDetails userDetails = userDetailsService.loadUserById(userId);

                    // 인증 객체 생성
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // SecurityContext에 저장
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("SecurityContext authentication set: {}", authentication.isAuthenticated());
                }
            }

        }catch (Exception e){
            log.debug("JWT auth failed: {}", e.getMessage(), e);

        }

        filterChain.doFilter(request, response);
    }
}
