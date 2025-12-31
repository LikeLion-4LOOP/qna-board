package com.example.qnaboard.domain.question;


import lombok.Getter;

@Getter
public enum QuestionCategory {
    DEV_IT("개발/IT"),
    EDUCATION("교육/학습"),
    HEALTH("건강/의료"),
    COOKING("요리/음식"),

    TRAVEL("여행/관광"),
    SHOPPING("쇼핑/구매"),
    LIFE("생활/가정"),
    HOBBY("취미/여가"),

    SPORTS("스포츠"),
    PET("반려동물"),
    CAR("자동차"),
    FINANCE("금융/재테크"),

    REAL_ESTATE("부동산"),
    LAW("법률/행정"),
    JOB("직업/진로"),
    ETC("기타");

    private final String displayName;

    QuestionCategory(String displayName) {
        this.displayName = displayName;
    }
}
