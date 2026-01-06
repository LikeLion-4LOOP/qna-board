package com.example.qnaboard.repository.report;

import com.example.qnaboard.domain.report.Report;
import com.example.qnaboard.domain.report.ReportTargetType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    boolean existsByReporter_IdAndTargetTypeAndTargetId(Long reporterUserPk,
                                                        ReportTargetType targetType,
                                                        Long targetId);

    void deleteByTargetId(Long targetId);
    void deleteByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);
    long countByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);
}
