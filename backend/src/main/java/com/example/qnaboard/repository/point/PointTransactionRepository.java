package com.example.qnaboard.repository.point;

import com.example.qnaboard.domain.point.PointTransaction;
import com.example.qnaboard.domain.point.PointType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface PointTransactionRepository extends JpaRepository<PointTransaction,Long> {

    Page<PointTransaction> findByUser_Id(Long userId, Pageable pageable);


    boolean existsByUser_IdAndTypeAndCreatedAtBetween(
            Long userId,
            PointType type,
            LocalDateTime start,
            LocalDateTime end
    );
}
