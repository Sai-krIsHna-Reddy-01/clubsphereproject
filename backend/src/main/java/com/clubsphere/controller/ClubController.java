package com.clubsphere.controller;

import com.clubsphere.dto.ClubDTO;
import com.clubsphere.dto.MembershipDTO;
import com.clubsphere.service.ClubService;
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
@RequestMapping("/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @GetMapping
    public ResponseEntity<List<ClubDTO>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubDTO> getClubById(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<ClubDTO> createClub(@Valid @RequestBody ClubDTO clubDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(clubService.createClub(clubDTO, auth.getName()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<ClubDTO> updateClub(@PathVariable Long id, @Valid @RequestBody ClubDTO clubDTO) {
        return ResponseEntity.ok(clubService.updateClub(id, clubDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinClub(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String requestMessage = body != null ? body.getOrDefault("requestMessage", "") : "";
        clubService.joinClub(id, auth.getName(), requestMessage);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveClub(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        clubService.leaveClub(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MembershipDTO>> getClubMembers(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubMembers(id));
    }

    @GetMapping("/{id}/requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<List<MembershipDTO>> getClubRequests(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubRequests(id));
    }

    @PutMapping("/requests/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<Void> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        clubService.updateRequestStatus(requestId, status);
        return ResponseEntity.ok().build();
    }
}
