package com.example.qnaboard.controller.report;

import com.example.qnaboard.dto.report.ReportCreateRequest;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 생성 (로그인 필요)
     * POST /api/reports
     */
    @PostMapping("/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public ReportService.ReportResult report(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ReportCreateRequest request
    ) {
        return reportService.report(
                userDetails.getUserId(),
                request.getTargetType(),
                request.getTargetId(),
                request.getReason()
        );
    }
}