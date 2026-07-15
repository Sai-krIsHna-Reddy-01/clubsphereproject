package com.clubsphere.repository;

import com.clubsphere.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByClubId(Long clubId);
    List<Announcement> findByClubIsNull();
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
