package com.example.qnaboard.repository.user;

import com.example.qnaboard.domain.user.ProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileImageRepository extends JpaRepository<ProfileImage, Long> {
    Optional<ProfileImage> findByUserId(Long userId);
}   // 하나의 프로필 가져와야 하니까 Optional
