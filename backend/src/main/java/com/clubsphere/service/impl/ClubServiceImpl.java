package com.clubsphere.service.impl;

import com.clubsphere.dto.ClubDTO;
import com.clubsphere.dto.MembershipDTO;
import com.clubsphere.entity.Club;
import com.clubsphere.entity.Membership;
import com.clubsphere.entity.User;
import com.clubsphere.exception.BadRequestException;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.ClubRepository;
import com.clubsphere.repository.MembershipRepository;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.service.ClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClubServiceImpl implements ClubService {

    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @Override
    public List<ClubDTO> getAllClubs() {
        return clubRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClubDTO getClubById(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));
        return convertToDTO(club);
    }

    @Override
    public ClubDTO createClub(ClubDTO clubDTO, String username) {
        // Frontend sends `name`, backend stores as `clubName`
        String clubName = clubDTO.getClubName() != null ? clubDTO.getClubName() : clubDTO.getName();
        if (clubName == null || clubName.isBlank()) {
            throw new BadRequestException("Club name is required");
        }
        if (clubRepository.existsByClubName(clubName)) {
            throw new BadRequestException("Club name is already taken");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Club club = Club.builder()
                .clubName(clubName)
                .description(clubDTO.getDescription())
                .category(clubDTO.getCategory())
                .facultyAdvisor(clubDTO.getFacultyAdvisor() != null ? clubDTO.getFacultyAdvisor() : "Faculty Advisor")
                .bannerUrl(clubDTO.getBannerUrl() != null ? clubDTO.getBannerUrl() : "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400")
                .status("APPROVED") // Auto-approve created clubs for connection simplicity
                .creatorId(user.getId())
                .build();

        Club savedClub = clubRepository.save(club);

        // Add creator as PRESIDENT (represented by status = APPROVED)
        Membership membership = Membership.builder()
                .club(savedClub)
                .user(user)
                .status("APPROVED")
                .build();
        membershipRepository.save(membership);

        return convertToDTO(savedClub);
    }

    @Override
    public ClubDTO updateClub(Long id, ClubDTO clubDTO) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + id));

        // Check name uniqueness if changed
        if (!club.getClubName().equalsIgnoreCase(clubDTO.getClubName()) &&
                clubRepository.existsByClubName(clubDTO.getClubName())) {
            throw new BadRequestException("Club name is already taken");
        }

        club.setClubName(clubDTO.getClubName());
        club.setDescription(clubDTO.getDescription());
        club.setCategory(clubDTO.getCategory());
        club.setFacultyAdvisor(clubDTO.getFacultyAdvisor());

        Club updatedClub = clubRepository.save(club);
        return convertToDTO(updatedClub);
    }

    @Override
    public void deleteClub(Long id) {
        if (!clubRepository.existsById(id)) {
            throw new ResourceNotFoundException("Club not found with id: " + id);
        }
        clubRepository.deleteById(id);
    }

    private ClubDTO convertToDTO(Club club) {
        int membersCount = 0;
        String creatorName = "Unknown";
        if (membershipRepository != null) {
            membersCount = membershipRepository.findByClubId(club.getId()).stream()
                    .filter(m -> m.getStatus().equalsIgnoreCase("APPROVED"))
                    .collect(Collectors.toList()).size();
        }
        if (club.getCreatorId() != null && userRepository != null) {
            User creator = userRepository.findById(club.getCreatorId()).orElse(null);
            if (creator != null) {
                creatorName = creator.getFirstName() + " " + creator.getLastName();
            }
        }

        return ClubDTO.builder()
                .id(club.getId())
                .clubName(club.getClubName())
                .name(club.getClubName())
                .description(club.getDescription())
                .category(club.getCategory())
                .facultyAdvisor(club.getFacultyAdvisor())
                .createdAt(club.getCreatedAt())
                .bannerUrl(club.getBannerUrl() != null ? club.getBannerUrl() : "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400")
                .status(club.getStatus())
                .creatorId(club.getCreatorId())
                .creatorName(creatorName)
                .membersCount(membersCount)
                .build();
    }

    @Override
    public void joinClub(Long clubId, String username, String requestMessage) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (membershipRepository.existsByUserIdAndClubId(user.getId(), club.getId())) {
            throw new BadRequestException("You have already requested to join or are a member of this club.");
        }

        Membership request = Membership.builder()
                .club(club)
                .user(user)
                .status("PENDING") // Join requests start as PENDING
                .build();

        membershipRepository.save(request);
    }

    @Override
    public void leaveClub(Long clubId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Membership membership = membershipRepository.findByUserIdAndClubId(user.getId(), clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

        membershipRepository.delete(membership);
    }

    @Override
    public List<MembershipDTO> getClubMembers(Long clubId) {
        return membershipRepository.findByClubId(clubId).stream()
                .filter(m -> m.getStatus().equalsIgnoreCase("APPROVED"))
                .map(this::convertToMembershipDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MembershipDTO> getClubRequests(Long clubId) {
        return membershipRepository.findByClubId(clubId).stream()
                .filter(m -> m.getStatus().equalsIgnoreCase("PENDING"))
                .map(this::convertToMembershipDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void updateRequestStatus(Long requestId, String status) {
        Membership req = membershipRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        String upper = status.toUpperCase();
        if (!upper.equals("APPROVED") && !upper.equals("REJECTED")) {
            throw new BadRequestException("Invalid status. Must be APPROVED or REJECTED");
        }

        if (upper.equals("APPROVED")) {
            req.setStatus("APPROVED");
            membershipRepository.save(req);
        } else {
            membershipRepository.delete(req);
        }
    }

    private MembershipDTO convertToMembershipDTO(Membership m) {
        return MembershipDTO.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .username(m.getUser().getUsername())
                .clubId(m.getClub().getId())
                .clubName(m.getClub().getClubName())
                .joinedDate(m.getJoinedDate())
                .status(m.getStatus())
                .build();
    }
}
