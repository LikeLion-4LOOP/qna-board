package com.example.qnaboard.service.user;

import com.example.qnaboard.domain.user.ProfileImage;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.user.response.ProfileImageBinaryResponse;
import com.example.qnaboard.exception.ProfileErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.user.ProfileImageRepository;
import com.example.qnaboard.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;


@Service
@RequiredArgsConstructor
@Transactional
public class ProfileImageService {
    private final UserRepository userRepository;
    private final ProfileImageRepository profileImageRepository;

    public void upload(Long userId, MultipartFile file) {
        // 1. 유저 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ProfileErrorCode.USER_NOT_FOUND));

        // 2. 파일 유효성 검사
        validateFile(file);

        // 3. 기존 프로필 이미지가 있다면 삭제
        profileImageRepository.findByUserId(userId)
                .ifPresent(image -> profileImageRepository.delete(image));

        try {
            ProfileImage profileImage = new ProfileImage(
                    user,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    file.getBytes()
            );
            profileImageRepository.save(profileImage);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    // 프로필 이미지 조회
    @Transactional
    public ProfileImageBinaryResponse download(Long userId) {
        ProfileImage img = profileImageRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ProfileErrorCode.PROFILE_IMAGE_NOT_FOUND));

        return new ProfileImageBinaryResponse(
                img.getOriginalName(),
                img.getContentType(),
                img.getData()
        );
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ProfileErrorCode.IMAGE_EMPTY);
        }
        if (!file.getContentType().startsWith("image/")) {
            throw new BusinessException(ProfileErrorCode.INVALID_IMAGE_TYPE);
        }
        // 용량 제한 (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException(ProfileErrorCode.IMAGE_TOO_LARGE);
        }
    }
}