package com.example.qnaboard.dto.report;

import com.example.qnaboard.domain.report.ReportTargetType;
import lombok.Getter;

@Getter
public class ReportCreateRequest {
    private ReportTargetType targetType;
    private Long targetId;
    private String reason;
}