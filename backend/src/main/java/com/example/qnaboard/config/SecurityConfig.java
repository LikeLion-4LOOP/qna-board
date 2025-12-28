package com.example.qnaboard.config;

import com.example.qnaboard.security.CustomUserDetailsService;
import com.example.qnaboard.security.JwtAuthenticationFilter;
import com.example.qnaboard.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@RequiredArgsConstructor
@EnableWebSecurity
@Configuration
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * SecurityFilterChain
     * - JWT 기반 API 서버의 기본 뼈대
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // [JWT 정석] 세션 기반이 아니므로 CSRF 비활성화
                .csrf(csrf -> csrf.disable())
                // CORS는 필요 시 추후 설정(지금은 defaults)
                .cors(Customizer.withDefaults())

                // [필수] Stateless: 세션 저장 X
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // [API 서버] 폼로그인/기본인증 끔
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // [인가] auth는 열고 그 외는 인증 필요
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtProvider, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
