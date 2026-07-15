package com.clubsphere.repository;

import com.clubsphere.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findByClubName(String clubName);
    Boolean existsByClubName(String clubName);
}
