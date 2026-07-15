package com.clubsphere.repository;

import com.clubsphere.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    List<Membership> findByUserId(Long userId);
    List<Membership> findByClubId(Long clubId);
    Optional<Membership> findByUserIdAndClubId(Long userId, Long clubId);
    Boolean existsByUserIdAndClubId(Long userId, Long clubId);
}
