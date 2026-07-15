package com.clubsphere.service.impl;

import com.clubsphere.dto.MembershipDTO;
import com.clubsphere.entity.Club;
import com.clubsphere.entity.Membership;
import com.clubsphere.entity.User;
import com.clubsphere.exception.BadRequestException;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.ClubRepository;
import com.clubsphere.repository.MembershipRepository;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;

    @Override
    public List<MembershipDTO> getAllMemberships() {
        return membershipRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MembershipDTO getMembershipById(Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found with id: " + id));
        return convertToDTO(membership);
    }

    @Override
    public MembershipDTO createMembership(MembershipDTO membershipDTO) {
        User user = userRepository.findById(membershipDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + membershipDTO.getUserId()));

        Club club = clubRepository.findById(membershipDTO.getClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + membershipDTO.getClubId()));

        if (membershipRepository.existsByUserIdAndClubId(user.getId(), club.getId())) {
            throw new BadRequestException("User is already a member or request is pending for this club");
        }

        Membership membership = Membership.builder()
                .user(user)
                .club(club)
                .status(membershipDTO.getStatus() != null ? membershipDTO.getStatus().toUpperCase() : "PENDING")
                .build();

        Membership savedMembership = membershipRepository.save(membership);
        return convertToDTO(savedMembership);
    }

    @Override
    public MembershipDTO updateMembershipStatus(Long id, String status) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found with id: " + id));

        String upperStatus = status.toUpperCase();
        if (!upperStatus.equals("PENDING") && !upperStatus.equals("APPROVED") && !upperStatus.equals("REJECTED")) {
            throw new BadRequestException("Invalid status. Allowed statuses are: PENDING, APPROVED, REJECTED");
        }

        membership.setStatus(upperStatus);
        Membership updatedMembership = membershipRepository.save(membership);
        return convertToDTO(updatedMembership);
    }

    private MembershipDTO convertToDTO(Membership membership) {
        return MembershipDTO.builder()
                .id(membership.getId())
                .userId(membership.getUser().getId())
                .username(membership.getUser().getUsername())
                .clubId(membership.getClub().getId())
                .clubName(membership.getClub().getClubName())
                .joinedDate(membership.getJoinedDate())
                .status(membership.getStatus())
                .build();
    }
}
