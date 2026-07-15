package com.clubsphere.service;

import com.clubsphere.dto.ClubDTO;

import java.util.List;

import com.clubsphere.dto.MembershipDTO;

public interface ClubService {
    List<ClubDTO> getAllClubs();
    ClubDTO getClubById(Long id);
    ClubDTO createClub(ClubDTO clubDTO, String username); // Add username to save creator
    ClubDTO updateClub(Long id, ClubDTO clubDTO);
    void deleteClub(Long id);
    void joinClub(Long clubId, String username, String requestMessage);
    void leaveClub(Long clubId, String username);
    List<MembershipDTO> getClubMembers(Long clubId);
    List<MembershipDTO> getClubRequests(Long clubId);
    void updateRequestStatus(Long requestId, String status);
}
