package com.clubsphere.service;

import com.clubsphere.dto.MembershipDTO;

import java.util.List;

public interface MembershipService {
    List<MembershipDTO> getAllMemberships();
    MembershipDTO getMembershipById(Long id);
    MembershipDTO createMembership(MembershipDTO membershipDTO);
    MembershipDTO updateMembershipStatus(Long id, String status);
}
