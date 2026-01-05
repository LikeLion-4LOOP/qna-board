package com.example.qnaboard.controller.point;

import com.example.qnaboard.dto.point.response.PointHistoryResponse;
import com.example.qnaboard.security.CustomUserDetails;
import com.example.qnaboard.service.point.UserPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users/me/points")
public class PointController {

    private final UserPointService userPointService;

    @GetMapping
    public Page<PointHistoryResponse> myPointHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = userDetails.getUserId();
        return userPointService.getMyPointHistory(userId, page, size);
    }
}
