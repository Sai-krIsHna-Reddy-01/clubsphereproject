package com.clubsphere.service;

import com.clubsphere.dto.CertificateDTO;

import java.util.List;

public interface CertificateService {
    List<CertificateDTO> getCertificatesByUserId(Long userId);
    String getCertificateHtml(String code);
    List<CertificateDTO> generateCertificatesForEvent(Long eventId);
    List<CertificateDTO> getAllCertificates();
}
