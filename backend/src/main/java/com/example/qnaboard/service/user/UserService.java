package com.example.qnaboard.service.user;

import com.example.qnaboard.dto.user.response.*;
import com.example.qnaboard.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserService {

    
    private final UserRepository userRepository;

    /**
     * 내 정보 조회
     * @param userId
     * @return
     */
    public UserResponse getUser(Long userId) {
        return null;
    }

    /**
     * 내 정보 수정 ( 현재는 이름만 수정)
     * @param userId
     * @param userName
     * @return
     */
    public UserResponse updateUsername(Long userId, String userName) {
        return null;
    }

    /**
     * 내가 작성한 질문 목록
     * @param userId
     * @param pageable
     * @return
     */

    public Page<MyQuestionSummaryResponse> getMyQuestions(Long userId, Pageable pageable) {
        return Page.empty(pageable);
    }

    /**
     * 내가 작성한 답변 목록
     * @param userId
     * @param pageable
     * @return
     */

    public Page<MyAnswerSummaryResponse> getMyAnswers(Long userId, Pageable pageable) {
        return Page.empty(pageable);
    }

    /**
     * 내가 작성한 댓글 목록
     * @param userId
     * @param pageable
     * @return
     */
    public Page<MyCommentSummaryResponse> getMyComments(Long userId, Pageable pageable) {
        return Page.empty(pageable);
    }
}
