package com.example.qnaboard.service.answer;

import com.example.qnaboard.domain.answer.Answer;
import com.example.qnaboard.dto.answer.*;
import com.example.qnaboard.repository.answer.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;

    @Override
    public AnswerResponseDto createAnswer(Long questionId, Long userId, AnswerCreateRequest requestDto) {
        // TODO: Question, User 조회 후 Answer 저장

        // 1) content 검증(빈 값 방지)
        if (requestDto.getContent() == null || requestDto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("답변 내용은 비어 있을 수 없습니다.");
        }
        // 2) Answer 생성
        Answer answer = new Answer();
        answer.setContent(requestDto.getContent());
        answer.setQuestionId(questionId);   // 임시 필드 사용
        answer.setUserid(userId);           // 임시 필드 사용
        answer.setVote(0);
        answer.setSelect(false);
        answer.setCreatedAt(LocalDateTime.now());
        answer.setUpdatedAt(LocalDateTime.now());

        // 3) 저장
        Answer saved = answerRepository.save(answer);

        // 4) DTO 반환
        return AnswerResponseDto.from(saved);

    }

    @Override
    public AnswerResponseDto updateAnswer(Long answerId, Long userId, AnswerUpdateRequestDto requestDto) {
        // TODO: Answer 조회 후 작성자 검증 및 수정

        // 0) 입력 검증
        if (requestDto.getContent() == null || requestDto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("수정 내용은 비어 있을 수 없습니다.");
        }

        // 1) Answer 조회
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + answerId));

        // 2) 작성자 검증 (임시 userId 필드 기준)
        if (answer.getUserid() == null || !answer.getUserid().equals(userId)) {
            throw new IllegalStateException("작성자만 답변을 수정할 수 있습니다.");
        }

        // 3) 내용 수정 + 수정시간 갱신
        answer.setContent(requestDto.getContent());
        answer.setUpdatedAt(LocalDateTime.now());

        // 4) 저장
        Answer saved = answerRepository.save(answer);

        // 5) DTO 반환
        return AnswerResponseDto.from(saved);
    }

    @Override
    public void deleteAnswer(Long answerId, Long userId) {
        // 1) Answer 조회
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + answerId));

        // 2) 작성자 검증
        if (answer.getUserid() == null || !answer.getUserid().equals(userId)) {
            throw new IllegalStateException("작성자만 답변을 삭제할 수 있습니다.");
        }

        // 3) 채택 여부 확인 (채택된 답변 삭제 불가)
        if (answer.isSelect()) {
            throw new IllegalStateException("채택된 답변은 삭제할 수 없습니다. 채택 해제 후 삭제하세요.");
        }

        // 4) 삭제
        answerRepository.delete(answer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnswerResponseDto> getAnswersByQuestion(Long questionId, Pageable pageable) {
        // TODO: 질문별 답변 조회 및 DTO 변환
        Page<Answer> answerPage =
                answerRepository.findByQuestionId(questionId, pageable);

        return answerPage.map(AnswerResponseDto::from);
    }

    @Override
    public void selectAnswer(Long answerId, Long userId) {
        // TODO: 질문 작성자 검증 후 채택
        // 1) 채택 대상 답변 조회
        Answer target = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + answerId));

        Long questionId = target.getQuestionId();
        if (questionId == null) {
            throw new IllegalStateException("questionId가 없어 채택할 수 없습니다.");
        }

        // 2) 질문 작성자 검증 (현재 Question 엔티티 없어서 임시 TODO)
        // TODO: Question 조회 후 question.getUserId() == userId 인지 검증
        // if (!questionOwnerId.equals(userId)) throw new IllegalStateException("질문 작성자만 채택할 수 있습니다.");

        // 3) 이미 채택된 답변이 있는지 확인하고, 있으면 해제(단, 다른 답변일 때만)
        answerRepository.findByQuestionIdAndIsSelectTrue(questionId)
                .ifPresent(selected -> {
                    if (!selected.getId().equals(answerId)) {
                        selected.setSelect(false);
                        selected.setUpdatedAt(LocalDateTime.now());
                        answerRepository.save(selected);
                    }
                });

        // 4) 대상 답변 채택 처리 (이미 채택이면 그대로 둬도 됨)
        if (!target.isSelect()) {
            target.setSelect(true);
            target.setUpdatedAt(LocalDateTime.now());
            answerRepository.save(target);
        }
    }

    @Override
    public void voteAnswer(Long answerId, Long userId) {
        // TODO: 추천 기능
        // 0) 로그인 체크는 컨트롤러/인증에서 보통 처리하지만, 서비스에서도 방어 가능
        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        // 1) Answer 조회
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + answerId));

        // 2) TODO: 중복 추천 방지 (AnswerVote 테이블 필요)
        // 예: if (answerVoteRepository.existsByAnswerIdAndUserId(answerId, userId)) throw ...

        // 3) 추천 수 증가
        answer.setVote(answer.getVote() + 1);
        answer.setUpdatedAt(LocalDateTime.now());

        // 4) 저장
        answerRepository.save(answer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Answer> getAnswersByUserId(Long userId, Pageable pageable) {
        return answerRepository.findByUserId(userId, pageable);
    }
}
