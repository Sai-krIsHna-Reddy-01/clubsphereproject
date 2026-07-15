package com.clubsphere.controller;

import com.clubsphere.dto.MembershipDTO;
import com.clubsphere.service.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping
    public ResponseEntity<List<MembershipDTO>> getAllMemberships() {
        return ResponseEntity.ok(membershipService.getAllMemberships());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembershipDTO> getMembershipById(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.getMembershipById(id));
    }

    @PostMapping
    public ResponseEntity<MembershipDTO> createMembership(@Valid @RequestBody MembershipDTO membershipDTO) {
        return new ResponseEntity<>(membershipService.createMembership(membershipDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLUB_MANAGER')")
    public ResponseEntity<MembershipDTO> updateMembershipStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(membershipService.updateMembershipStatus(id, status));
    }
}
