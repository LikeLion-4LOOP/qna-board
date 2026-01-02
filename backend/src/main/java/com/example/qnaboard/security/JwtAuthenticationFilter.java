package com.example.qnaboard.security;

import com.example.qnaboard.exception.AuthErrorCode;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
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
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            var claims = jwtProvider.parseClaims(token);

            String typ = claims.get("typ", String.class);
            if (!"access".equals(typ)) {
                request.setAttribute(AuthErrorCode.class.getName(), AuthErrorCode.INVALID_TOKEN);
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            Long userId = Long.valueOf(claims.getSubject());
            UserDetails userDetails = userDetailsService.loadUserById(userId);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (ExpiredJwtException e) {
            request.setAttribute(AuthErrorCode.class.getName(), AuthErrorCode.EXPIRED_TOKEN);
            SecurityContextHolder.clearContext();
        } catch (JwtException | IllegalArgumentException e) {
            request.setAttribute(AuthErrorCode.class.getName(), AuthErrorCode.INVALID_TOKEN);
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            request.setAttribute(AuthErrorCode.class.getName(), AuthErrorCode.UNAUTHORIZED);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
