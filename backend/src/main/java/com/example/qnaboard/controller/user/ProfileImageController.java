package com.example.qnaboard.controller.user;

import com.example.qnaboard.service.user.ProfileImageService;
import com.example.qnaboard.dto.user.response.ProfileImageBinaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class ProfileImageController {

    private final ProfileImageService profileImageService;

// 프로필 이미지 업로드
    @PostMapping("/me/profile-image")
    public ResponseEntity<Void> uploadProfileImage(
            @RequestAttribute Long userId, // 인터셉터나 필터에서 넘겨준 로그인 유저 ID
            @RequestParam("file") MultipartFile file) {

        profileImageService.upload(userId, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/profile-image")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Long userId) {
        ProfileImageBinaryResponse response = profileImageService.download(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, response.getContentType())
                .body(response.getData());
    }
}