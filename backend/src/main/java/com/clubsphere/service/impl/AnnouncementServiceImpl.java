package com.clubsphere.service.impl;

import com.clubsphere.dto.AnnouncementDTO;
import com.clubsphere.entity.Announcement;
import com.clubsphere.entity.Club;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.AnnouncementRepository;
import com.clubsphere.repository.ClubRepository;
import com.clubsphere.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ClubRepository clubRepository;

    @Override
    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto) {
        Club club = null;
        if (dto.getClubId() != null) {
            club = clubRepository.findById(dto.getClubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + dto.getClubId()));
        }

        Announcement announcement = Announcement.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .club(club)
                .build();

        Announcement saved = announcementRepository.save(announcement);
        return convertToDTO(saved);
    }

    private AnnouncementDTO convertToDTO(Announcement announcement) {
        return AnnouncementDTO.builder()
                .id(announcement.getId())
                .clubId(announcement.getClub() != null ? announcement.getClub().getId() : null)
                .clubName(announcement.getClub() != null ? announcement.getClub().getClubName() : "System Announcement")
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .createdAt(announcement.getCreatedAt())
                .build();
    }
}
