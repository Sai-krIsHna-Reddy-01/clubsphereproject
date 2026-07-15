package com.clubsphere.service.impl;

import com.clubsphere.dto.DashboardStatsDTO;
import com.clubsphere.repository.ClubRepository;
import com.clubsphere.repository.EventRegistrationRepository;
import com.clubsphere.repository.EventRepository;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    @Override
    public DashboardStatsDTO getStats() {
        long totalClubs = clubRepository.count();
        long totalEvents = eventRepository.count();
        long totalStudents = userRepository.count();
        long totalRegistrations = eventRegistrationRepository.count();

        List<DashboardStatsDTO.MonthlyEventsData> monthlyEvents = new ArrayList<>();
        monthlyEvents.add(new DashboardStatsDTO.MonthlyEventsData("May", 2));
        monthlyEvents.add(new DashboardStatsDTO.MonthlyEventsData("Jun", 4));
        monthlyEvents.add(new DashboardStatsDTO.MonthlyEventsData("Jul", totalEvents));

        List<DashboardStatsDTO.ClubGrowthData> clubGrowth = new ArrayList<>();
        clubGrowth.add(new DashboardStatsDTO.ClubGrowthData("May", 1));
        clubGrowth.add(new DashboardStatsDTO.ClubGrowthData("Jun", 2));
        clubGrowth.add(new DashboardStatsDTO.ClubGrowthData("Jul", totalClubs));

        List<DashboardStatsDTO.MostActiveClubsData> mostActiveClubs = new ArrayList<>();
        clubRepository.findAll().forEach(club -> {
            long score = eventRepository.findByClubId(club.getId()).size() * 10L + 5;
            mostActiveClubs.add(new DashboardStatsDTO.MostActiveClubsData(club.getClubName(), score));
        });

        List<DashboardStatsDTO.ParticipationStatsData> participationStats = new ArrayList<>();
        participationStats.add(new DashboardStatsDTO.ParticipationStatsData("Technology", 40.0));
        participationStats.add(new DashboardStatsDTO.ParticipationStatsData("Business", 30.0));
        participationStats.add(new DashboardStatsDTO.ParticipationStatsData("Arts", 15.0));
        participationStats.add(new DashboardStatsDTO.ParticipationStatsData("Sports", 15.0));

        return DashboardStatsDTO.builder()
                .totalClubs(totalClubs)
                .totalEvents(totalEvents)
                .totalStudents(totalStudents)
                .totalRegistrations(totalRegistrations)
                .monthlyEvents(monthlyEvents)
                .clubGrowth(clubGrowth)
                .mostActiveClubs(mostActiveClubs)
                .participationStats(participationStats)
                .build();
    }
}
