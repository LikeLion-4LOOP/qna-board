package com.example.qnaboard.dto.question.response;

public record QuestionImageBinaryResponse( String originalName,
                                           String contentType,
                                           byte[] data
) {}
