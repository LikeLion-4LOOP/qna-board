package com.example.qnaboard.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "report.threshold")
public class ReportThresholdProperties {
    private int question = 5;
    private int answer = 5;
    private int comment = 5;
}
