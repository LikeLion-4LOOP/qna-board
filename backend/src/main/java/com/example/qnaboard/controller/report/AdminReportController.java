package com.example.qnaboard.controller.report;

import com.example.qnaboard.domain.report.ReportTargetType;
import com.example.qnaboard.service.report.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/report")
public class AdminReportController {

    private final AdminReportService adminReportService;

    // 숨김된 목록
    @GetMapping("/hidden/{targetType}")
    public Page<?> hidden(@PathVariable ReportTargetType targetType, Pageable pageable) {
        return adminReportService.getHiddenTargets(targetType, pageable);
    }

    //신고된 글 삭제
    @PostMapping("/targets/{targetType}/{targetId}/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTarget(
            @PathVariable ReportTargetType targetType,
            @PathVariable Long targetId
    ) {
        adminReportService.delete(targetType, targetId);
    }

    //신고 된 글 숨김해제
    @PostMapping("/targets/{targetType}/{targetId}/restore")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void restoreTarget(
            @PathVariable ReportTargetType targetType,
            @PathVariable Long targetId
    ) {
        adminReportService.restore(targetType, targetId);
    }
}
