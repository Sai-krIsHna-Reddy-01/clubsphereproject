package com.clubsphere.controller;

import com.clubsphere.dto.CertificateDTO;
import com.clubsphere.dto.EventDTO;
import com.clubsphere.dto.EventRegistrationDTO;
import com.clubsphere.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(eventService.createEvent(eventDTO, auth.getName()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<EventRegistrationDTO> registerForEvent(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(eventService.registerForEvent(id, auth.getName()), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        eventService.cancelRegistration(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<List<EventRegistrationDTO>> getEventRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventRegistrations(id));
    }

    @PostMapping("/{id}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<Void> markAttendance(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<Long, Boolean> attendance = new java.util.HashMap<>();
        if (body.containsKey("userId")) {
            Long userId = ((Number) body.get("userId")).longValue();
            Boolean attended = (Boolean) body.get("attended");
            attendance.put(userId, attended);
        } else {
            body.forEach((k, v) -> {
                try {
                    attendance.put(Long.parseLong(k), (Boolean) v);
                } catch (NumberFormatException e) {
                    // Ignore non-numeric keys
                }
            });
        }
        eventService.markAttendance(id, attendance);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/generate-certificates")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<List<CertificateDTO>> generateCertificates(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.generateCertificates(id));
    }
}
