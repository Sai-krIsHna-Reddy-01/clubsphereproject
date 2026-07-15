package com.clubsphere.service;

import com.clubsphere.dto.AnnouncementDTO;

import java.util.List;

public interface AnnouncementService {
    List<AnnouncementDTO> getAllAnnouncements();
    AnnouncementDTO createAnnouncement(AnnouncementDTO dto);
}
