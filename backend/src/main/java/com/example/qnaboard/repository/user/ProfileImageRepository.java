package com.example.qnaboard.repository.user;

import com.example.qnaboard.domain.user.ProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileImageRepository extends JpaRepository<ProfileImage, Long> {
    Optional<ProfileImage> findByUser_Id(Long userId);
}
