package com.clubsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalClubs;
    private long totalEvents;
    private long totalStudents;
    private long totalRegistrations;
    private List<MonthlyEventsData> monthlyEvents;
    private List<ClubGrowthData> clubGrowth;
    private List<MostActiveClubsData> mostActiveClubs;
    private List<ParticipationStatsData> participationStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyEventsData {
        private String name;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClubGrowthData {
        private String name;
        private long clubs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MostActiveClubsData {
        private String name;
        private long score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipationStatsData {
        private String name;
        private double value;
    }
}
