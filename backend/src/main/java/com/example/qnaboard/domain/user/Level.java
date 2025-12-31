package com.example.qnaboard.domain.user;

public enum Level {
    BRONZE(0), SILVER(100), GOLD(400), PLATINUM(1000);
    private final int minPoint;

    Level(int minPoint) {
        this.minPoint = minPoint;
    }

    public static Level fromPoint(int point){
        Level result = BRONZE;
        for(Level level : Level.values()){
            if(point >level.minPoint)
                result= level;
        }
        return result;
    }
}
