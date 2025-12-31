package com.example.qnaboard.service.user;

import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPointService {
    private final UserRepository userRepository;

    public void rewardForLogin(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        user.addPoint(5);
    }
    public void rewardForPostQuestion(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        user.addPoint(10);
    }
    public void rewardForPostAnswer(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        user.addPoint(10);
    }
    public void rewardForPostComment(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        user.addPoint(1);
    }
    public void rewardForVote(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        user.addPoint(1);
    }
    public void rewardForSelectedAnswer(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        user.addPoint(50);
    }



}
