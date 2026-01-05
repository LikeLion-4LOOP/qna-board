package com.example.qnaboard.controller.question;


import com.example.qnaboard.dto.question.response.QuestionImageBinaryResponse;
import com.example.qnaboard.dto.question.response.QuestionImageMetaResponse;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.question.QuestionImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.qnaboard.exception.common.BusinessException;

import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
public class QuestionImageController {
    private final QuestionImageService questionImageService;

    @PostMapping("/{questionId}/images")
    public ResponseEntity<Void> upload(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long questionId,
            @RequestPart("files") List<MultipartFile> files
    ) {
        questionImageService.upload(userDetails.getUserId(), questionId, files);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{questionId}/images")
    public ResponseEntity<List<QuestionImageMetaResponse>> list(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionImageService.list(questionId));
    }

    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> download(@PathVariable Long imageId) {
        try {
            QuestionImageBinaryResponse res = questionImageService.download(imageId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(res.contentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + res.originalName() + "\"")
                    .body(res.data());
        } catch (BusinessException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
