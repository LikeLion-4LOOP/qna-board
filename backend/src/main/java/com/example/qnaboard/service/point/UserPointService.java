package com.example.qnaboard.service.point;

import com.example.qnaboard.domain.point.PointTransaction;
import com.example.qnaboard.domain.point.PointType;
import com.example.qnaboard.domain.user.User;
import com.example.qnaboard.dto.point.response.PointHistoryResponse;
import com.example.qnaboard.exception.UserErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.point.PointTransactionRepository;
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class UserPointService {
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;

    private static final int LOGIN_DAILY_REWARD = 5;
    private static final int QUESTION_REWARD = 10;
    private static final int ANSWER_REWARD = 10;
    private static final int COMMENT_REWARD = 1;
    private static final int VOTE_REWARD = 1;
    private static final int VOTE_CANCEL = -1;
    private static final int SELECTED_ANSWER_REWARD = 50;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    public void rewardForLogin(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        //오늘 날짜 계산
        LocalDate today = LocalDate.now(KST);
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        boolean already = pointTransactionRepository
                .existsByUser_IdAndTypeAndCreatedAtBetween(userId, PointType.LOGIN_DAILY, start, end);

        if (already) return;
        int newBalance = user.getPoint() + LOGIN_DAILY_REWARD;

        pointTransactionRepository.save(new PointTransaction(user, PointType.LOGIN_DAILY, LOGIN_DAILY_REWARD,newBalance));
        user.addPoint(LOGIN_DAILY_REWARD);
    }
    @Transactional
    public void rewardForPostQuestion(Long userId) {
        apply(userId, PointType.POST_QUESTION, QUESTION_REWARD);
    }

    @Transactional
    public void rewardForPostAnswer(Long userId) {
        apply(userId, PointType.POST_ANSWER, ANSWER_REWARD);
    }

    @Transactional
    public void rewardForPostComment(Long userId) {
        apply(userId, PointType.POST_COMMENT, COMMENT_REWARD);
    }

    @Transactional
    public void rewardForVote(Long userId) {
        apply(userId, PointType.VOTE_REWARD, VOTE_REWARD);
    }

    @Transactional
    public void cancelRewardForVote(Long userId){
        apply(userId, PointType.VOTE_CANCEL, VOTE_CANCEL);
    }

    @Transactional
    public void rewardForSelectedAnswer(Long userId) {
        apply(userId, PointType.SELECTED_ANSWER, SELECTED_ANSWER_REWARD);
    }



    public Page<PointHistoryResponse> getMyPointHistory(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PointTransaction> result = pointTransactionRepository.findByUser_Id(userId, pageable);

        return result.map(tx -> new PointHistoryResponse(
                tx.getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getBalanceSnapShot(),
                tx.getCreatedAt()
        ));
    }




    private void apply(Long userId, PointType type, int amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        int newBalance = user.getPoint() + amount;
        pointTransactionRepository.save(new PointTransaction(user, type, amount,newBalance));
        user.addPoint(amount);
    }



}
