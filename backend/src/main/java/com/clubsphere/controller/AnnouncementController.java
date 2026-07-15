package com.clubsphere.controller;

import com.clubsphere.dto.AnnouncementDTO;
import com.clubsphere.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(@RequestBody AnnouncementDTO announcementDTO) {
        return new ResponseEntity<>(announcementService.createAnnouncement(announcementDTO), HttpStatus.CREATED);
    }
}
