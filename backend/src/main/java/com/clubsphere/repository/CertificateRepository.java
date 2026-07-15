package com.clubsphere.repository;

import com.clubsphere.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateCode(String certificateCode);
    List<Certificate> findByUserId(Long userId);
    List<Certificate> findByEventId(Long eventId);
    Boolean existsByEventIdAndUserId(Long eventId, Long userId);
}
