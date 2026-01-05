package com.example.qnaboard.dto.question.response;

public record QuestionImageMetaResponse( Long id,
                                         String originalName,
                                         String contentType,
                                         Long size
) {}
