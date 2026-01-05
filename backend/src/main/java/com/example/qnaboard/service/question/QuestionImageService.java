package com.example.qnaboard.service.question;

import com.example.qnaboard.domain.question.Question;
import com.example.qnaboard.domain.question.QuestionImage;
import com.example.qnaboard.dto.question.response.QuestionImageBinaryResponse;
import com.example.qnaboard.dto.question.response.QuestionImageMetaResponse;
import com.example.qnaboard.exception.QuestionErrorCode;
import com.example.qnaboard.exception.common.BusinessException;
import com.example.qnaboard.repository.question.QuestionImageRepository;
import com.example.qnaboard.repository.question.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionImageService {
    private final QuestionRepository questionRepository;
    private final QuestionImageRepository questionImageRepository;

    // 업로드: 질문 작성자만 허용하고 싶으면 userId를 받아서 체크
    public void upload(Long userId, Long questionId, List<MultipartFile> files) {
        if (userId == null) {
            // 프로젝트에 AUTH 에러코드가 있으면 그걸 쓰는 게 더 좋아.
            throw new BusinessException(QuestionErrorCode.LOGIN_REQUIRED);
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.QUESTION_NOT_FOUND));

        // 질문 작성자만 이미지 업로드 허용 (원치 않으면 이 블록 삭제)
        if (!question.getUser().getId().equals(userId)) {
            throw new BusinessException(QuestionErrorCode.QUESTION_FORBIDDEN);
        }

        if (files == null || files.isEmpty()) {
            throw new BusinessException(QuestionErrorCode.IMAGE_EMPTY);
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BusinessException(QuestionErrorCode.INVALID_IMAGE_TYPE);
            }

            // 5MB 제한 (원하면 조정)
            long max = 5L * 1024 * 1024;
            if (file.getSize() > max) {
                throw new BusinessException(QuestionErrorCode.IMAGE_TOO_LARGE);
            }

            try {
                byte[] data = file.getBytes();
                String originalName = (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank())
                        ? "image"
                        : file.getOriginalFilename();

                QuestionImage img = new QuestionImage(question, originalName, contentType, file.getSize(), data);
                questionImageRepository.save(img);

            } catch (IOException e) {
                // 너희 GlobalExceptionHandler가 Exception을 500으로 처리하니 여기선 RuntimeException OK
                throw new RuntimeException(e);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<QuestionImageMetaResponse> list(Long questionId) {
        return questionImageRepository.findByQuestion_Id(questionId).stream()
                .map(img -> new QuestionImageMetaResponse(
                        img.getId(),
                        img.getOriginalName(),
                        img.getContentType(),
                        img.getSize()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionImageBinaryResponse download(Long imageId) {
        QuestionImage img = questionImageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException(QuestionErrorCode.IMAGE_NOT_FOUND));

        return new QuestionImageBinaryResponse(img.getOriginalName(), img.getContentType(), img.getData());
    }
}
