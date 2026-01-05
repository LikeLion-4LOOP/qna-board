package com.example.qnaboard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/questions/images/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET")
                .allowedHeaders("*");
    }
}