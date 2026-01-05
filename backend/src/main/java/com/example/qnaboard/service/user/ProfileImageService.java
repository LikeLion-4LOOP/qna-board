package com.example.qnaboard.service.user;

import com.example.qnaboard.domain.user.ProfileImage;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.user.response.ProfileImageBinaryResponse;
import com.example.qnaboard.exception.ProfileErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.user.ProfileImageRepository;
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileImageService {

    private final UserRepository userRepository;
    private final ProfileImageRepository profileImageRepository;

    public void upload(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ProfileErrorCode.USER_NOT_FOUND));

        validateFile(file);

        profileImageRepository.findByUser_Id(userId)
                .ifPresent(img -> {
                    profileImageRepository.delete(img);
                    profileImageRepository.flush();
                });


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

    @Transactional(readOnly = true)
    public ProfileImageBinaryResponse download(Long userId) {
        ProfileImage img = profileImageRepository.findByUser_Id(userId)
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
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(ProfileErrorCode.INVALID_IMAGE_TYPE);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException(ProfileErrorCode.IMAGE_TOO_LARGE);
        }
    }
}
